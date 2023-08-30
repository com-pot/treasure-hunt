import { createEntityEndpoints, EntityEndpoints } from "../model/model"
import { EntityConfig, TypefulModule } from "../typeful"
import appLogger from "../../../app/appLogger"
import { Notice } from "../../../app/types/errors"
import { getSchemaField } from "../typeSystem"
import { toPath } from "lodash"

const logger = appLogger.child({ s: "EntityRegistry" })

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

    stringify?: string | { template: string },
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
            ...{ ...entity, plural: undefined },
            meta,
            persistence: entity.persistence || 'mongo',
            endpoints: createEntityEndpoints(meta),
            primaryKey: entity.primaryKey || 'id',
        }

        const notices = validateEntity(entry)

        if (notices?.filter((notice) => notice.severity === "error").length) {
            logger.error({ fqn: entry.meta.entityFqn, notices }, "misconfigured-model-skipped")
            return
        }
        if (notices?.length) {
            logger.warn({ fqn: entry.meta.entityFqn, notices }, "misconfigured-model")
        }

        this.entities.push(entry)
        this.entitiesIndex[entry.meta.entityFqn] = entry
    }

    get(name: string): EntityConfigEntry {
        return this.entitiesIndex[name]
    }
}


type ValidationNotice = Notice & { severity: "warn" | "error" }
export function validateEntity(entity: EntityConfigEntry): ValidationNotice[] | null {
    const notices: ValidationNotice[] = []
    for (let validation of entityValidations) {
        if (validation(notices, entity) === false) break
    }

    return notices.length ? notices : null
}

const entityValidations: ((notices: ValidationNotice[], entity: EntityConfigEntry) => boolean | void)[] = [
    function entityHasSchema(notices, entity) {
        // TODO: Perform a deep validation
        if (!entity.schema) {
            notices.push({ severity: "error", message: "no-schema-specified", data: {} })
            return false
        }
    },
    function validateEntityPrimaryKey(notices, entity) {
        if (entity.publish === false) return

        const pkSchema = getSchemaField(entity.schema, entity.primaryKey)
        if (!pkSchema) {
            if (toPath(entity.primaryKey).length !== 1) {
                notices.push({ severity: "error", message: "undefined-pk", data: { pk: entity.primaryKey } })
                return false
            }

            entity.schema.properties = {
                [entity.primaryKey]: {type: "string", "x-gen": "id"},
                ...entity.schema.properties,
            }
            // notices.push({ severity: "warn", message: "implicit-pk", data: {} })
        }
    },
]

