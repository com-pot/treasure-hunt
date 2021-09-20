import mongodb from "mongodb";

import { createRouter } from "./router.js"
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
}

export const startUp = async (serviceContainer) => {
    return {
        router: createRouter(serviceContainer.entityRegistry, serviceContainer.controllerFactory),
    }
}
