import { EntityInstance } from "../../typeful/typeful"

export default {
    type: 'object',
    properties: {
        type: {type: 'string'},
        arguments: { type: "object", additionalProperties: true, format: "json" },
        shouldBeMet: {type: 'bool'},
    },
}

export type ConditionEntity = EntityInstance & {
    type: string,
    arguments: Record<string, unknown>,

    /** undefined should be interpreted as true */
    shouldBeMet?: boolean,
}
