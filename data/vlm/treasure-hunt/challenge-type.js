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
                correctPath: {
                    type: 'list',
                    innerType: {type: 'string'},
                },
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
