import condition, { ConditionEntity } from "../../typeful-executive/model/condition"

export const TreasureHuntContentBlock = {
    type: 'schema',
    fields: {
        type: {type: 'string'},
        content: {type: 'json'},
        if: {...condition, required: false},
    },
}

export type TreasureHuntContentBlockEntity = {
    id?: string,

    type: string,
    config: Record<string, unknown>,
    if?: ConditionEntity,
}
