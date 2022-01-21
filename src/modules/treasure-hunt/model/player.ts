import { UserEntity } from "../../auth/model/user"
import { EntityInstance, EntityRef } from "../../typeful/typeful"
import { StoryEntity } from "./story"

export default {
    type: 'schema',
    fields: {
        user: {type: 'relation', target: 'auth.user'},
        story: {type: 'relation', target: 'treasure-hunt.story'},
    },
}

export type PlayerEntity = EntityInstance & {
    user: EntityRef<UserEntity>,
    story: EntityRef<StoryEntity>,
}
