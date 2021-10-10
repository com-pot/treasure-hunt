import { EntityConfig, TypefulModule } from "../typeful"


export type EntityConfigEntry = EntityConfig & {
    meta: {
        module: string,
        name: string,
        collectionName: string,
        entityFqn: string,
        collectionFqn: string,
    }
}

export default class EntityRegistry {
    
    public readonly entities: EntityConfigEntry[]
    private entitiesIndex: Record<string, EntityConfigEntry>
    
    constructor() {
        this.entities = []
        this.entitiesIndex = {}
    }
    
    registerModule(moduleName: string, module: TypefulModule): this {
        Object.entries(module.entities!).forEach(([entityName, entity]) => {
            const collectionName = entity.plural || entityName + 's'
            if (!entity.strategy) {
                entity.strategy = {}
            }
            if (!entity.strategy.type) {
                entity.strategy.type = 'mongo'
            }
            if (!entity.strategy.primaryKey) {
                entity.strategy.primaryKey = 'id'
            }
            
            const entry: EntityConfigEntry = {
                ...entity,
                meta: {
                    module: moduleName,
                    name: entityName,
                    collectionName,

                    entityFqn: `${moduleName}.${entityName}`,
                    collectionFqn: `${moduleName}.${collectionName}`,
                }
            }
            
            if (entry.meta.entityFqn === entry.meta.collectionName) {
                console.warn("Collection and entity resulted in same name: " + entry.meta.entityFqn + ". Ignoring");
                return
            }
            
            this.entities.push(entry)
            this.entitiesIndex[entry.meta.entityFqn] = entry
        })
        
        return this
    }
    
    get(name: string): EntityConfigEntry {
        return this.entitiesIndex[name]
    }
}
