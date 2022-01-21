import { EntityInstance, EntityRef } from "../../typeful/typeful"
import { ChallengeEntity } from "./challenge"
import { StoryEntity } from "./story"

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

        contentBlocks: {type: 'json'},
        contentHtml: {type: 'string'},
        challenge: {type: 'relation', target: 'treasure-hunt.challenge'},
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
}
