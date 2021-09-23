export default {
    type: 'schema',
    fields: {
        player: {type: 'relation', target: 'treasure-hunt.player'},
        story: {type: 'relation', target: 'treasure-hunt.story'},
        order: {type: 'number'},
    },
}
