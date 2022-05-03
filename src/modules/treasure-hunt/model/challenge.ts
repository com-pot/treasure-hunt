import { ActionStruct } from "../../typeful-executive/model/action"
import { EntityInstance, EntityRef } from "../../typeful/typeful"

const ChallengeActionEffect = {
    type: 'schema',
    fields: {
        name: {type: 'string'},
        arguments: {
            type: 'list',
            innerType: {type: 'string'},
        },
    },
}

const ChallengeClueUsage = {
    type: 'schema',
    fields: {
        clue: {type: 'relation', target: 'treasure-hunt.clue'},
        effect: {
            type: 'schema',
            fields: {
                whenActive: { type: 'json' },
                whenWrongOrder: {type: 'json' },
            },
        },
    },
}
const ChallengeCluesSetup = {
    type: 'schema',
    fields: {
        strategy: {const: 'linear-path'},

        list: {
            type: 'array',
            innerType: ChallengeClueUsage,
        },
        clueDefaults: {
            type: 'json',
        },
    },
}

export default {
    type: 'schema',
    fields: {
        name: {type: 'string'},
        description: {type: 'string'},
        type: {type: 'relation', target: 'treasure-hunt.challenge-type'},
        challengeConfig: {type: 'json'},
        onError: {type: 'list'},
        checkSum: {type: 'string'},

        cluesSetup: ChallengeCluesSetup,
    },
}

export type ChallengeEntity = EntityInstance & {
    name: string,
    description: string,
    type: EntityRef<EntityInstance>,
    challengeConfig: object,
    customController?: string,

    checkSum?: string,
    onError?: ActionStruct[],
}
