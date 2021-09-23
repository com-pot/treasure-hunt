export default class EntityRegistry {
    constructor() {
        this.entities = []
        this.entitiesIndex = {}
        
    }
    
    registerModule(moduleName, module) {
        Object.entries(module.entities).forEach(([entityName, entity]) => {
            const collectionName = entity.plural || entityName + 's'
            if (!entity.strategy) {
                entity.strategy = {type: 'dao'}
            }
            if (!entity.strategy.primaryKey) {
                entity.strategy.primaryKey = 'id'
            }

            const entry = {
                config: entity,

                module: moduleName,
                name: entityName,
                collectionName,

                entityFqn: `${moduleName}.${entityName}`,
                collectionFqn: `${moduleName}.${collectionName}`,
            }

            if (entry.entityFqn === entry.collectionName) {
                console.warn("Collection and entity resulted in same name: " + entry.entityFqn + ". Ignoring");
                return
            }

            this.entities.push(entry)
            this.entitiesIndex[entry.entityFqn] = entry
        })
        
        return this
    }
    
    registerModules(modules) {
        Object.entries(modules)
            .forEach(([name, module]) => module.entities && this.registerModule(name, module))
        
        return this
    }

    get(name) {
        return this.entitiesIndex[name]
    }
}
