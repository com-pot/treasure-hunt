import { EntityInstance } from "../../typeful/typeful"
import condition, { ConditionEntity } from "./condition"

export default {
    type: 'object',
    properties: {
        type: {type: 'string'},
        arguments: { type: "object", additionalProperties: true, format: "json" },

        if: condition,
    },
}

export type ActionStruct = {
    type: string,
    arguments: Record<string, unknown>,

    if?: ConditionEntity,
}
export type ActionEntity = EntityInstance & ActionStruct
