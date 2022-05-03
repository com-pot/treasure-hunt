import { EntityInstance } from "../../typeful/typeful"

export default {
    type: 'schema',
    fields: {
        type: {type: 'string'},
        arguments: {type: 'json'},
    },
}

export type ConditionEntity = EntityInstance & {
    type: string,
    arguments: Record<string, unknown>,
}
