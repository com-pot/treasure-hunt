import { EntityInstance } from "../../typeful/typeful"
import condition, { ConditionEntity } from "./condition"

export default {
    type: 'schema',
    fields: {
        type: {type: 'string'},
        arguments: {type: 'json'},

        if: condition,
    },
}

export type ActionStruct = {
    type: string,
    arguments: Record<string, unknown>,

    if?: ConditionEntity,
}
export type ActionEntity = EntityInstance & ActionStruct
