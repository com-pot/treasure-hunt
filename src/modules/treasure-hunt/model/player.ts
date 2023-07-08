import { UserEntity } from "../../auth/model/user"
import { EntityInstance, EntityRef } from "../../typeful/typeful"
import { StoryEntity } from "./story"

export default {
    type: 'object',
    properties: {
        user: {type: 'relation', target: 'auth.user'},
        story: {type: 'relation', target: 'treasure-hunt.story'},

        itemBag: {type: 'array', items: 'string'},
    },
}

export type PlayerEntity = EntityInstance & {
    user: EntityRef<UserEntity>,
    story: EntityRef<StoryEntity>,

    itemBag?: string[],
}
