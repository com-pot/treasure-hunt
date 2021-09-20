export default {
    type: 'schema',
    fields: {
        name: {type: 'string'},
        description: {type: 'string'},
        type: {type: 'relation', target: 'treasure-hunt.challenge-type'},
        challengeConfig: {type: 'json'},
    },
}
