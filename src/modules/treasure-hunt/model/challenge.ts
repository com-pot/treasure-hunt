import { EntityInstance, EntityRef } from "../../typeful/typeful"

export default {
    type: 'schema',
    fields: {
        name: {type: 'string'},
        description: {type: 'string'},
        type: {type: 'relation', target: 'treasure-hunt.challenge-type'},
        challengeConfig: {type: 'json'},
        onError: {type: 'list'},
        checkSum: {type: 'string'},
    },
}

type OnErrorAction = [string] | [string, ...(string|number)[]]
export type ChallengeEntity = EntityInstance & {
    name: string,
    description: string,
    type: EntityRef<EntityInstance>,
    challengeConfig: object,

    checkSum?: string,
    onError?: OnErrorAction[],
}
