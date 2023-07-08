import sotwChallengeType from '../../sotw/treasure-hunt/challenge-type'

export default {
    collection: [
        ...sotwChallengeType.collection,
        {
            type: 'time-tables',
        },
        {
            type: 'clue-chase',
            params: {
                type: "object",
                properties: {
                    correctPath: {
                        type: 'array',
                        items: {type: 'string'},
                    },
                },
                required: ["correctPath"],
            },
        },
        {
            type: 'counter-selection',
        },
        {
            type: 'skull-lite',
        }
    ],
}
