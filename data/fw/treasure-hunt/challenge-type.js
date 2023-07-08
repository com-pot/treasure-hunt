import vlmChallengeType from '../../sotw/treasure-hunt/challenge-type'

export default {
    collection: [
        ...vlmChallengeType.collection,
        {
            type: 'shortCircuit',
        },
        {
            type: 'eq',
        },
        {
            type: 'appendages',
            params: true,
        },
        {
            type: 'ckSequence',
        },
        {
            type: 'field-activity',
        },
    ],
}
