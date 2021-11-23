import { EntityConfig, PersistenceStrategy, TypefulModule } from "../typeful"


export type EntityConfigEntry = EntityConfig & {
    meta: {
        module: string,
        name: string,
        collectionName: string,
        entityFqn: string,
        collectionFqn: string,
    }
    strategy: NonNullable<EntityConfig['strategy']>
}

const initStrategy = (strategy?: Partial<PersistenceStrategy>): PersistenceStrategy => {
    strategy = Object.assign({}, strategy)
    if (!strategy.type) {
        strategy.type = 'mongo'
    }
    if (!strategy.primaryKey) {
        strategy.primaryKey = 'id'
    }

    return strategy as PersistenceStrategy
}

export default class EntityRegistry {

    public readonly entities: EntityConfigEntry[]
    private entitiesIndex: Record<string, EntityConfigEntry>

    constructor() {
        this.entities = []
        this.entitiesIndex = {}
    }

    registerModule(moduleName: string, module: TypefulModule): this {
        module.entities && Object.entries(module.entities).forEach(([entityName, entity]) => {
            const collectionName = entity.plural || entityName + 's'

            const entry: EntityConfigEntry = {
                ...entity,
                meta: {
                    module: moduleName,
                    name: entityName,
                    collectionName,

                    entityFqn: `${moduleName}.${entityName}`,
                    collectionFqn: `${moduleName}.${collectionName}`,
                },
                strategy: initStrategy(entity.strategy),
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
