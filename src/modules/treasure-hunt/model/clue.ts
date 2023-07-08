import action, { ActionEntity } from "../../typeful-executive/model/action"
import { EntityInstance, EntityRef } from "../../typeful/typeful"
import { StoryEntity } from "./story"
import { TreasureHuntContentBlock, TreasureHuntContentBlockEntity } from "./_content"


export const ClueLocation = {
    type: 'object',
    properties: {
        location: {type: 'geo-location'},
        radius: {type: 'precision'},
        lastUpdated: {type: 'timestamp'},
    },
}

export default {
    type: 'object',
    properties: {
        name: {type: 'string'},
        slug: {type: 'string', format: 'slug', minLength: 1},
        story: {type: 'relation', target: 'treasure-hunt.story'},
        tags: {type: 'array', items: {type: 'string'}},

        onReveal: {
            type: 'array',
            items: action,
        },

        // place: {...ClueLocation, required: false},

        contentBlocks: {
            type: "array",
            items: TreasureHuntContentBlock,
        },
    },

    unique: [
        'slug',
    ],
}

export type ClueEntity = EntityInstance & {
    name: string,
    slug: string,
    story: EntityRef<StoryEntity>,
    tags?: string[],

    onReveal: ActionEntity[],

    contentBlocks: TreasureHuntContentBlockEntity[],
}

