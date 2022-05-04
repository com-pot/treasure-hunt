import { EntityInstance } from "../../typeful/typeful"

export default {
    type: 'schema',
    fields: {
        type: {type: 'string'},
        arguments: {type: 'json'},
        shouldBeMet: {type: 'bool'},
    },
}

export type ConditionEntity = EntityInstance & {
    type: string,
    arguments: Record<string, unknown>,

    /** undefined should be interpreted as true */
    shouldBeMet?: boolean,
}
