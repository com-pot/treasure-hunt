import condition, { ConditionEntity } from "../../typeful-executive/model/condition"

export const TreasureHuntContentBlock = {
    type: 'object',
    properties: {
        type: {type: 'string'},
        content: { type: "object", additionalProperties: true, format: "json" },
        if: condition,
    },
}

export type TreasureHuntContentBlockEntity = {
    id?: string,

    type: string,
    config: Record<string, unknown>,
    if?: ConditionEntity,
}
