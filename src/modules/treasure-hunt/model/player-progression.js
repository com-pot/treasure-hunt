import playerTimeout from "./player-timeout.js"

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
