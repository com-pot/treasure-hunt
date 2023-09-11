import {MongoClient} from "mongodb"
import Router from "@koa/router"
import ensureJsonRequest from "../../app/middleware/ensureJsonRequest"

import EntityRegistry, { CollectionSpec, EntityConfigEntry } from "./services/EntityRegistry"
import IntegrityService from "./services/IntegrityService"
import TypeRegistry from "./services/TypeRegistry"

import TypefulAccessor from "./services/TypefulAccessor"
import { AppModule, ServiceContainer } from "../../app/types/app"
import {EntityPluginModule, TypefulModule } from "./typeful"
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
        .forEach(([name, module]) => module.entities && entityRegistry.registerModule(name, module.entities))
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
                entity._plugins.service = entityPlugin.create(serviceContainer.typefulAccessor, entity) as EntityPluginModule
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

function staticEntityConfig(entity: Readonly<EntityConfigEntry>) {
    const working = {...entity} as Partial<EntityConfigEntry>
    delete working._plugins

    return working as Omit<EntityConfigEntry, "_plugins">
}
function createCollectionsIndex(entities: EntityConfigEntry[]) {
    const collectionIndex: Record<string, CollectionSpec & { entity: ReturnType<typeof staticEntityConfig> }> = {}
    entities.forEach((entity) => {
        const surplusCollections = Object.keys(entity.meta.collections).filter((id) => id !== "default")
        if (surplusCollections.length) {
            console.warn("Non-default collections not implemented on", {entity, surplusCollections})
        }

        const collection = entity.meta.collections.default
        if (collectionIndex[collection.id]) {
            console.warn("Collection already registered, skipping", {id: collection.id, entity})
            return
        }

        collectionIndex[collection.id] = {
            ...collection,
            entity: staticEntityConfig(entity),
        }
    })

    return collectionIndex
}
function createCollectionRouter(publicEntities: EntityConfigEntry[], tfa: TypefulAccessor, schemaService: SchemaService) {
    const collectionIndex = createCollectionsIndex(publicEntities)
    const router = new Router()

    router.get("/collection/:id", (ctx) => {
        const collection = collectionIndex[ctx.params.id]
        if (!collection) {
            throw new AppError('not-found', 404, { reason: 'collection-not-found', by: ["id"] })
        }

        ctx.body = collection
    })

    router.get("/collection/:id/items", async (ctx) => {
        const collection = collectionIndex[ctx.params.id]
        if (!collection) {
            throw new AppError('not-found', 404, { reason: 'collection-not-found', by: ["id"] })
        }

        const ctrl = tfa.getDao(collection.entity.meta.entityFqn)
        if (!ctrl?.list) {
            throw new AppError('not-supported', 501, { reason: 'listing-not-available' })
        }

        const filter = schemaService.createFilterCriteria(collection.entity, ctx.query)
        const pagination = createPaginationFromQuery(ctx.query)

        ctx.body = await ctrl.list(ctx.actionContext, filter, undefined, pagination)
    })

    return router
}

function createBackstageRouter(publicEntities: EntityConfigEntry[], tfa: TypefulAccessor, schemaService: SchemaService) {
    const router = new Router()
    router.use(ensureJsonRequest())

    const collectionsRouter = createCollectionRouter(publicEntities, tfa, schemaService)
    collectionsRouter.prefix("/typeful")
    router.use(collectionsRouter.routes())
    router.use(collectionsRouter.allowedMethods())

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
