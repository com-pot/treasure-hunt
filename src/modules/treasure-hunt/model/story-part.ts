import { EntityInstance, EntityRef } from "../../typeful/typeful"
import { ChallengeEntity } from "./challenge"
import { StoryEntity } from "./story"
import { TreasureHuntContentBlock, TreasureHuntContentBlockEntity } from "./_content"

export default {
    type: 'schema',
    fields: {
        story: {
            type: 'relation',
            target: 'treasure-hunt.story',
        },
        title: {type: 'string'},
        order: {type: 'number'},
        slug: {type: 'string'},

        contentBlocks: {
            type: 'json',
            description: "HTML content blocks for use with contentController=inline",
        },
        contentHtml: {
            type: 'string',
            description: "HTML content for use with contentController=inline",
        },
        challenge: {
            type: 'relation', target: 'treasure-hunt.challenge',
            description: "Challengefor use with contentController=inline",
        },

        contentController: {
            type: 'string', enum: ['inline', 'th-blocks'],
        },
        thContentBlocks: {
            type: 'list',
            innerType: TreasureHuntContentBlock,
        },
    },
}

export type StoryPartEntity = EntityInstance & {
    story: EntityRef<StoryEntity>,
    title: string,
    order: number,
    slug: string,

    contentBlocks: object,
    contentHtml: string,
    challenge?: EntityRef<ChallengeEntity>,

    contentController: 'inline' | 'th-blocks' | string,
    thContentBlocks?: TreasureHuntContentBlockEntity[],
}
