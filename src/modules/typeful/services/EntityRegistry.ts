import { createEntityEndpoints, EntityEndpoints } from "../model/model"
import { EntityConfig, TypefulModule } from "../typeful"

export type CollectionSpec = { id: string }
export type EntityConfigEntry = Omit<EntityConfig, 'plural'> & {
    meta: {
        module: string,
        name: string,
        entityFqn: string,
        collections: { default: CollectionSpec } & Record<string, CollectionSpec>,
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
        const defaultCollectionId = `${moduleName}__${entity.plural || entityName + 's'}`
            .replace(/[^\w\.]/g, () => "_")

        const meta: EntityConfigEntry['meta'] = {
            module: moduleName,
            name: entityName,

            entityFqn: `${moduleName}.${entityName}`,
            collections: {
                default: { id: defaultCollectionId },
            },
        }
        const entry: EntityConfigEntry = {
            ...{...entity, plural: undefined},
            meta,
            persistence: entity.persistence || 'mongo',
            endpoints: createEntityEndpoints(meta),
            primaryKey: entity.primaryKey || 'id',
        }

        this.entities.push(entry)
        this.entitiesIndex[entry.meta.entityFqn] = entry
    }

    get(name: string): EntityConfigEntry {
        return this.entitiesIndex[name]
    }
}
