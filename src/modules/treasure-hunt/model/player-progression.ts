import { EntityInstance, EntityRef } from "../../typeful/typeful.js"
import playerTimeout, { PlayerTimeoutStruct } from "./player-timeout"
import { PlayerEntity } from "./player.js"
import { StoryPartEntity } from "./story-part.js"

export default {
    type: 'schema',
    fields: {
        player: {type: 'relation', target: 'treasure-hunt.player'},
        storyPart: {type: 'relation', target: 'treasure-hunt.story-part'},
        status: {type: 'string'},
        data: {type: 'json'},
        timeout: playerTimeout,
    },
}

export type PlayerProgressionEntity = EntityInstance & {
    player: EntityRef<PlayerEntity>,
    storyPart: EntityRef<StoryPartEntity>,
    status: string,
    data: Record<string, any>|null,
    timeout: PlayerTimeoutStruct,
}
