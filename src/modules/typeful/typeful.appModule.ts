import {MongoClient} from "mongodb"
import Router from "@koa/router"
import ensureJsonRequest from "../../app/middleware/ensureJsonRequest"

import EntityRegistry, { EntityConfigEntry } from "./services/EntityRegistry"
import IntegrityService from "./services/IntegrityService"
import TypeRegistry from "./services/TypeRegistry"

import TypefulAccessor from "./services/TypefulAccessor"
import { AppModule, ServiceContainer } from "../../app/types/app"
import {TypefulModule } from "./typeful"
import AppError from "../../app/AppError"
import { Dao, PaginationParam } from "./services/dao/Daos"
import DaoFactory from "./services/DaoFactory"
import MongoDao from "./services/dao/MongoDao"
import StaticDao from "./services/dao/StaticDao"
import SchemaService from "./services/SchemaService"

const initMongoClient = async (mongoUrl: string) => {
    const client = new MongoClient(mongoUrl)
    await client.connect()

    return client
}

export type TypefulConfig = {
    mongo: {
        url: string,
    },
    staticDataMask?: string,
}

export const typesPrefix = ''
export const types = require('./defaultTypesModule').default.types // eslint-disable-line @typescript-eslint/no-var-requires
export const entities: AppModule['entities'] = {
    model: {
        primaryKey: 'meta.entityFqn',
        persistence: 'static',
    },
}

export const compose = async (serviceContainer: ServiceContainer, config: TypefulConfig) => {
    const modules = serviceContainer.modules as Record<string, TypefulModule>

    const typeRegistry = new TypeRegistry()
    Object.entries(modules)
        .forEach(([name, module]) => typeRegistry.registerTypes(module, module.typesPrefix ?? name))
    serviceContainer.typeRegistry = typeRegistry

    const entityRegistry = new EntityRegistry()
    Object.entries(modules)
        .forEach(([name, module]) => module.entities && entityRegistry.registerModule(name, module))
    serviceContainer.entityRegistry = entityRegistry

    serviceContainer.integrityService = new IntegrityService(serviceContainer.typeRegistry)
    serviceContainer.schemaService = new SchemaService(serviceContainer.integrityService)

    serviceContainer.daoFactory = createDaoFactory(serviceContainer, config)

    serviceContainer.mongoClient = await initMongoClient(config.mongo.url)
    serviceContainer.typefulAccessor = new TypefulAccessor(serviceContainer)

    entityRegistry.entities.forEach((entity) => {
        for (const name of Object.keys(entity._plugins)) {
            const entityPlugin = entity._plugins[name]
            if (name === 'service' && 'create' in entityPlugin) {
                entity._plugins.service = entityPlugin.create(serviceContainer.typefulAccessor, entity.meta.entityFqn)
                continue
            }

            console.warn(`Misconfigured entity module ${entity.meta.entityFqn}:${name}`)

        }
    })
}
function createDaoFactory(serviceContainer: ServiceContainer, config: TypefulConfig): DaoFactory {
    const daoFactory = new DaoFactory()
    daoFactory.registerCreateFn('mongo', (model) => new MongoDao(model, serviceContainer.mongoClient, serviceContainer.integrityService))
    daoFactory.registerCreateFn('static', (model) => {
        if (!config.staticDataMask) {
            throw new Error("No typeful.staticDataMask provided")
        }

        return new StaticDao(model, config.staticDataMask)
    })
    return daoFactory
}

export const startUp = async (serviceContainer: ServiceContainer) => {
    const entityRegistry: EntityRegistry = serviceContainer.entityRegistry
    const typefulAccessor: TypefulAccessor = serviceContainer.typefulAccessor

    const publicEntities = entityRegistry.entities
        .filter((ent) => ent.publish !== false)

    const modelDao = typefulAccessor.getDao('typeful.model') as StaticDao<any>
    modelDao.overrideItems(Object.values(publicEntities).map((entity) => {
        const publicRepresentation: Partial<typeof entity> = {...entity}
        delete publicRepresentation._plugins
        delete publicRepresentation.persistence

        return publicRepresentation
    }))

    return {
        backstageRouter: createBackstageRouter(publicEntities, typefulAccessor, serviceContainer.schemaService),
    }
}


function registerDaoController(ent: EntityConfigEntry, router: Router, ctrl: Dao, schemaService: SchemaService) {
    const endpoints = ent.endpoints
    if (ctrl.list) {
        router.get(endpoints.collection, async (ctx) => {
            const filter = schemaService.createFilterCriteria(ent, ctx.query)
            const pagination = createPaginationFromQuery(ctx.query)

            const result = await ctrl.list(ctx.actionContext, filter, undefined, pagination)
            ctx.set('coll-total', '' + result.total)
            ctx.set('coll-page', '' + result.page)
            ctx.set('coll-per-page', '' + result.perPage)

            ctx.body = result.items
        })
    }


    if (ctrl.findOne) {
        router.get(endpoints.entityExact, async (ctx) => {
            ctx.body = await ctrl.findOne(ctx.actionContext, schemaService.createFilterCriteria(ent, ctx.query, ctx.params.id))
            if (!ctx.body) {
                throw new AppError('entity-not-found', 404, {
                    reason: 'filter-matched-nothing'
                })
            }
        })
        router.get(endpoints.entityAny, async (ctx) => {
            ctx.body = await ctrl.findOne(ctx.actionContext, schemaService.createFilterCriteria(ent, ctx.query))
            if (!ctx.body) {
                throw new AppError('entity-not-found', 404, {
                    reason: 'filter-matched-nothing'
                })
            }
        })
    }
    if (ctrl.create) {
        router.post(endpoints.entityAny, async (ctx) => {
            ctx.body = await ctrl.create(ctx.actionContext, ctx.request.body)
        })
    }

    if (ctrl.update) {
        router.put(endpoints.entityExact, async(ctx) => {
            ctx.body = await ctrl.update(ctx.actionContext, ctx.params.id, ctx.request.body)
        })
    }

    if (ctrl.delete) {
        router.delete(endpoints.entityExact, async(ctx) => {
            const result = await ctrl.delete(ctx.actionContext, ctx.params.id)
            if (result === true) {
                ctx.status = 204
                ctx.body = ''
                return
            }

            ctx.body = {
                result
            }
        })
    }
}

function createBackstageRouter(publicEntities: EntityConfigEntry[], tfa: TypefulAccessor, schemaService: SchemaService) {
    const router = new Router()
    router.use(ensureJsonRequest())

    publicEntities
        .forEach((ent) => {
            const ctrl = tfa.getDao(ent.meta.entityFqn)
            registerDaoController(ent, router, ctrl, schemaService)
        })

    return router
}

function parsePaginationInteger(input: unknown): number {
    const value = Number(input)
    return typeof value === 'number' && Number.isSafeInteger(value) && value > 0 ? value : 0
}

function createPaginationFromQuery(query: Record<string, unknown>): PaginationParam {
    return {
        page: parsePaginationInteger(query._page),
        perPage: parsePaginationInteger(query._perPage),
    }
}
