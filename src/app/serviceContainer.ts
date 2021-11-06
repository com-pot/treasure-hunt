import { EventEmitter } from "events"
import Config from "./Config"

import { AppModule, ServiceContainer } from "./types/app"

export const createServiceContainer = async (modules: Record<string, AppModule>, config: Config): Promise<ServiceContainer> => {
    const serviceContainer: ServiceContainer = {
        modules,
        eventBus: new EventEmitter()
    }
    
    const allPrepared = Object.entries(modules).map(async ([name, module]) => {
        await (module.compose && module.compose(serviceContainer, config.data[name]))
    })
    await Promise.all(allPrepared)
    
    return serviceContainer
}
