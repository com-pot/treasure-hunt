import {MongoClient} from "mongodb"
import Router from "@koa/router"
import ensureJsonRequest from "../../app/middleware/ensureJsonRequest"

import EntityRegistry, { EntityConfigEntry } from "./services/EntityRegistry"
import IntegrityService from "./services/IntegrityService"
import TypeRegistry from "./services/TypeRegistry"

import TypefulAccessor from "./services/TypefulAccessor"
import { ServiceContainer } from "../../app/types/app"
import {EntityModelSchema, TypefulModule } from "./typeful"
import AppError from "../../app/AppError"
import { Dao, FilterCriteria } from "./services/dao/Daos"
import DaoFactory from "./services/DaoFactory"
import MongoDao from "./services/dao/MongoDao"
import StaticDao from "./services/dao/StaticDao"
import { createFilterCriteria } from "./services/SchemaService"

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
type EntityEndpoints = {
    entityAny: string,
    entityExact: string,
    collection: string,
}

type SchemaIndexEntry = {
    name: string,
    endpoints: EntityEndpoints,
    schema: EntityModelSchema,
    primaryKey: string,
}

export const typesPrefix = ''
export const types = require('./defaultTypesModule').default.types // eslint-disable-line @typescript-eslint/no-var-requires

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

    const daoFactory = new DaoFactory()
    daoFactory.registerCreateFn('mongo', (model) => new MongoDao(model, serviceContainer.mongoClient, serviceContainer.integrityService))
    daoFactory.registerCreateFn('static', (model) => {
        if (!config.staticDataMask) {
            throw new Error("No typeful.staticDataMask provided")
        }

        return new StaticDao(model, config.staticDataMask)
    })

    serviceContainer.daoFactory = daoFactory

    serviceContainer.mongoClient = await initMongoClient(config.mongo.url)
    serviceContainer.typefulAccessor = new TypefulAccessor(serviceContainer)

    entityRegistry.entities.forEach((entity) => {
        for (const name of Object.keys(entity._plugins)) {
            const module = entity._plugins[name]
            if (name === 'service' && 'create' in module) {
                entity._plugins.service = module.create(serviceContainer.typefulAccessor, entity.meta.entityFqn)
                continue
            }

            console.warn(`Misconfigured entity module ${entity.meta.entityFqn}:${name}`)

        }
    })
}

export const startUp = async (serviceContainer: ServiceContainer) => {
    return {
        backstageRouter: createBackstageRouter(serviceContainer.entityRegistry, serviceContainer.typefulAccessor),
    }
}


function registerDaoController(ent: EntityConfigEntry, router: Router, ctrl: Dao, endpoints: EntityEndpoints) {
    if (ctrl.list) {
        router.get(endpoints.collection, async (ctx) => {
            const result = await ctrl.list(ctx.actionContext, createFilterCriteria(ent, ctx.query))
            ctx.set('coll-total', '' + result.total)
            ctx.set('coll-page', '' + result.page)

            ctx.body = result.items
        })
    }


    if (ctrl.findOne) {
        router.get(endpoints.entityExact, async (ctx) => {
            ctx.body = await ctrl.findOne(ctx.actionContext, createFilterCriteria(ent, ctx.query, ctx.params.id))
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

function createBackstageRouter(entityRegistry: EntityRegistry, tfa: TypefulAccessor) {
    const router = new Router()
    router.use(ensureJsonRequest())

    const schemas: Record<string, SchemaIndexEntry> = {}

    entityRegistry.entities.forEach((ent) => {
        if (ent.publish === false) {
            return
        }

        const ctrl = tfa.getDao(ent.meta.entityFqn)
        const endpoints = createEntityEndpoints(ent)
        registerDaoController(ent, router, ctrl, endpoints)

        schemas[ent.meta.entityFqn] = {
            name: ent.meta.entityFqn,
            endpoints,
            schema: ent.model,
            primaryKey: ent.strategy.primaryKey,
        }
    })

    router.get('/schemas/', (ctx) => {
        ctx.body = Object.values(schemas)
    })

    router.get('/schema/:name', (ctx) => {
        const schema = schemas[ctx.params.name]
        if (!schema) {
            throw new AppError('not-found', 404, {'by:name': ctx.params.name})
        }
        ctx.body = schema
    })

    return router
}

function createEntityEndpoints(ent: EntityConfigEntry): EntityEndpoints {
    const entityAny = `/${ent.meta.module}/${ent.meta.name}`

    return {
        entityAny,
        entityExact: entityAny + '/:id',
        collection: `/${ent.meta.module}/${ent.meta.collectionName}`,
    }
}
