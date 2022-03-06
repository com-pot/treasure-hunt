import { EntityInstance } from "../typeful";
import { ArgumentValue, FilterCriteria } from "./dao/Daos";
import { EntityConfigEntry } from "./EntityRegistry";



export function createFilterCriteria(ent: EntityConfigEntry, query: Record<string, string|string[]|undefined>|null, primaryKey?: string|number): FilterCriteria|undefined {
    if (!query && !primaryKey) {
        return
    }
    const filter: FilterCriteria = {}
    if (primaryKey) {
        filter[ent.strategy.primaryKey] = primaryKey
    }

    query && Object.entries(query).forEach(([name, value]) => {
        const modelField = ent.model.fields[name]
        if (!modelField) {
            return
        }
        let arg: ArgumentValue = value === undefined ? true : value

        filter[name] = arg
    })

    return filter
}

export const isEntityInstance = (subject: unknown): subject is EntityInstance => {
    if (!subject || typeof subject !== 'object') {
        return false
    }

    const id = (subject as any)['_id']
    return !!id && typeof id === 'object'
}
