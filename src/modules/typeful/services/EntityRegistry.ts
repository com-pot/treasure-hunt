import { createEntityEndpoints, EntityEndpoints } from "../model/model"
import { EntityConfig, TypefulModule } from "../typeful"


export type EntityConfigEntry = Omit<EntityConfig, 'plural'> & {
    meta: {
        module: string,
        name: string,
        collectionName: string,
        entityFqn: string,
        collectionFqn: string,
    }
    persistence: NonNullable<EntityConfig['persistence']>

    primaryKey: string,
    endpoints: EntityEndpoints,

    stringify?: string | {template: string},
}

export default class EntityRegistry {

    public readonly entities: EntityConfigEntry[]
    private entitiesIndex: Record<string, EntityConfigEntry>

    constructor() {
        this.entities = []
        this.entitiesIndex = {}
    }

    registerModule(moduleName: string, module: TypefulModule): this {
        module.entities && Object.entries(module.entities)
            .forEach(([entityName, entity]) => this.registerEntity(moduleName, entityName, entity))

        return this
    }

    private registerEntity(moduleName: string, entityName: string, entity: EntityConfig): void {
        const collectionName = entity.plural || entityName + 's'

        const meta: EntityConfigEntry['meta'] = {
            module: moduleName,
            name: entityName,
            collectionName,

            entityFqn: `${moduleName}.${entityName}`,
            collectionFqn: `${moduleName}.${collectionName}`,
        }
        const entry: EntityConfigEntry = {
            ...{...entity, plural: undefined},
            meta,
            persistence: entity.persistence || 'mongo',
            endpoints: createEntityEndpoints(meta),
            primaryKey: entity.primaryKey || 'id',
        }

        if (entry.meta.entityFqn === entry.meta.collectionName) {
            console.warn("Collection and entity resulted in same name: " + entry.meta.entityFqn + ". Ignoring");
            return
        }

        this.entities.push(entry)
        this.entitiesIndex[entry.meta.entityFqn] = entry
    }

    get(name: string): EntityConfigEntry {
        return this.entitiesIndex[name]
    }
}
