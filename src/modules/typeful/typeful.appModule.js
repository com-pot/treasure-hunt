import mongodb from "mongodb";

import { createBackstageRouter } from "./router.js"
import ControllerFactory from "./services/ControllerFactory.js"
import EntityRegistry from "./services/EntityRegistry.js"
import IntegrityService from "./services/IntegrityService.js"
import TypeRegistry from "./services/TypeRegistry.js"

import defaultTypesModule from "./defaultTypesModule.js"

const initMongoClient = async () => {
    const client = new mongodb.MongoClient(process.env.MONGO_URL)
    await client.connect()

    return client
}

export const compose = async (serviceContainer) => {
    serviceContainer.typeRegistry = new TypeRegistry()
        .registerTypes(defaultTypesModule)
    serviceContainer.entityRegistry = new EntityRegistry()
        .registerModules(serviceContainer.modules)
    serviceContainer.integrityService = new IntegrityService(serviceContainer.typeRegistry)
    serviceContainer.controllerFactory = new ControllerFactory(serviceContainer)

    serviceContainer.mongoClient = await initMongoClient()

    serviceContainer.entityRegistry.entities.forEach((entity) => {
        if (entity.config.service) {
            if (entity.config.service.mongoClient === null) {
                entity.config.service.mongoClient = serviceContainer.mongoClient
            }
        }
    })

    serviceContainer.model = new Proxy({}, {
        get(target, name) {
            const entity = serviceContainer.entityRegistry.get(name)
            if (!entity) {
                throw new Error(`Entity ${name} does not exist`)
            }
            if (!entity.config.service) {
                throw new Error(`Enttiy ${name} does not have a service associated`)
            }
            return entity.config.service
        }
    })
}

export const startUp = async (serviceContainer) => {
    return {
        backstageRouter: createBackstageRouter(serviceContainer.entityRegistry, serviceContainer.controllerFactory),
    }
}
