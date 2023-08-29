import { EntityConfigEntry } from "../services/EntityRegistry"

export default {
    type: 'object',
    properties: {
        name: {type: 'string'},
        endpoints: {
            type: 'object',
            properties: {
                entityAny: {type: 'string'},
                entityExact: {type: 'string'},
                collection: {type: 'string'},
            },
        },
        meta: {
            module: {type: 'string'},
            name: {type: 'string'},
            entityFqn: {type: 'string'},
            collections: {
                type: "object",
                properties: {
                    default: {type: "string"},
                },
                additionalProperties: {type: "string"},
            },
        },
        schema: { type: "object", additionalProperties: true, format: "json" },
    },
}

export type EntityEndpoints = {
    entityAny: string,
    entityExact: string,
    collection: string,
}

export function createEntityEndpoints(entMeta: EntityConfigEntry['meta']): EntityEndpoints {
    const entityAny = `/${entMeta.module}/${entMeta.name}`

    return {
        entityAny,
        entityExact: entityAny + '/:id',
        collection: `/typeful/collection/${entMeta.collections.default.id}/items`,
    }
}
