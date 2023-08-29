import { EntityInstance } from "../typeful";
import { getSchemaField } from "../typeSystem";
import { ArgumentValue, FilterCriteria } from "./dao/Daos";
import { EntityConfigEntry } from "./EntityRegistry";
import IntegrityService from "./IntegrityService";

export default class SchemaService {

    constructor(private readonly integrityService: IntegrityService) {}

    createFilterCriteria(ent: Pick<EntityConfigEntry, "primaryKey" | "schema">, query: Record<string, string|string[]|undefined>|null, primaryKeyValue?: string|number): FilterCriteria|undefined {
        if (!query && !primaryKeyValue) {
            return
        }
        const filter: FilterCriteria = {}
        if (primaryKeyValue) {
            filter[ent.primaryKey] = primaryKeyValue
        }

        query && Object.entries(query).forEach(([name, value]) => {
            const fieldSpec =  getSchemaField(ent.schema, name)
            if (!fieldSpec) {
                return
            }
            let arg: ArgumentValue = value === undefined ? true : value
            const sanitized = this.integrityService.sanitize(fieldSpec, value)

            filter[name] = sanitized !== undefined ? sanitized : arg
        })

        return filter
    }
}

export const isEntityInstance = (subject: unknown): subject is EntityInstance => {
    if (!subject || typeof subject !== 'object') {
        return false
    }

    const id = (subject as any)['_id']
    return !!id && typeof id === 'object' && !Array.isArray(id)
}
