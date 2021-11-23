import { EntityInstance, EntityRef } from "../../typeful/typeful"
import { PlayerEntity } from "./player"
import { StoryEntity } from "./story"

export default {
    type: 'schema',
    fields: {
        player: {type: 'relation', target: 'treasure-hunt.player'},
        story: {type: 'relation', target: 'treasure-hunt.story'},
        order: {type: 'number'},
        redeemedAt: {type: 'date'},
    },
}

export type TrophyEntity = EntityInstance & {
    player: EntityRef<PlayerEntity>,
    story: EntityRef<StoryEntity>,
    order: number,
    redeemedAt: Date,
}
