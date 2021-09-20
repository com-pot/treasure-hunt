export default {
    type: 'schema',
    fields: {
        user: {type: 'relation', target: 'auth.user'},
        story: {type: 'relation', target: 'treasure-hunt.story'},
    },
}
