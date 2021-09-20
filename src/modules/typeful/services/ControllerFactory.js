import cloneDeep from "lodash/cloneDeep.js"

import DeclarativeController from "../controllers/DaoController.js"
import StaticController from "../controllers/StaticController.js"

export default class ControllerFactory {
    constructor(serviceContainer) {
        this.serviceContainer = serviceContainer
    }
    
    createController(entityFqn, config) {
        const ctrl = this._getControllerInstance(entityFqn, config)
        this._autoInjectDependencies(ctrl)

        return ctrl
    }
    
    _getControllerInstance(entityFqn, config) {
        let strategy = cloneDeep(config.strategy)
        if (!strategy) {
            strategy = {type: 'dao'}
        }
        
        if (strategy.type === 'static') {
            return new StaticController(entityFqn, config, strategy)
        }
        
        if (strategy.type !== 'dao') {
            console.warn(`Unknown strategy '${strategy.type}' on ${entityFqn}. Using default 'dao'`)
            strategy.type = 'dao'
        }
        
        if (strategy.type === 'dao') {
            strategy.mongoClient = this.serviceContainer.mongoClient
        }
        
        
        return new DeclarativeController(entityFqn, config, strategy)
    }

    _autoInjectDependencies(ctrl) {
        if ('integrityService' in ctrl) {
            ctrl.integrityService = this.serviceContainer.integrityService
        }
    }
}
