import { ActionStruct } from "../../typeful-executive/model/action"
import { EntityInstance, EntityRef } from "../../typeful/typeful"

const ChallengeActionEffect = {
    type: 'object',
    properties: {
        name: {type: 'string'},
        arguments: {
            type: 'array',
            items: {type: 'string'},
        },
    },
}

const ChallengeClueUsage = {
    type: 'object',
    properties: {
        clue: { type: 'relation', target: 'treasure-hunt.clue' },
        effect: {
            type: 'object',
            properties: {
                whenActive: { type: "object", additionalProperties: true, format: "json" },
                whenWrongOrder: { type: "object", additionalProperties: true, format: "json" },
            },
        },
    },
}
const ChallengeCluesSetup = {
    type: 'object',
    properties: {
        strategy: {const: 'linear-path'},

        list: {
            type: 'array',
            items: ChallengeClueUsage,
        },
        clueDefaults: { type: "object", additionalProperties: true, format: "json" },
    },
}

export default {
    type: 'object',
    properties: {
        name: {type: 'string'},
        description: {type: 'string'},
        type: {type: 'relation', target: 'treasure-hunt.challenge-type'},
        challengeConfig: {type: 'object', additionalProperties: true, format: "json"},
        onError: {type: 'array', items: true},
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
