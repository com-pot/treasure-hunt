export default {
    type: 'schema',
    fields: {
        player: {type: 'relation', target: 'treasure-hunt.player'},
        storyPart: {type: 'relation', target: 'treasure-hunt.story-part'},
        data: {type: 'json'},
    },
}
