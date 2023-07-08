import { UserEntity } from "../../auth/model/user"
import { EntityInstance, EntityRef } from "../../typeful/typeful"

export default {
    type: 'object',
    properties: {
        since: {type: 'date'},
        until: {type: 'date'},
        clearedAt: {type: 'date'},
        clearedBy: {type: 'relation', target: 'auth.user'},
    },
}

export type PlayerTimeoutStruct = {
    since: Date,
    until: Date,
    clearedAt?: Date,
    clearedBy?: EntityRef<UserEntity>
}

export type PlayerTimeoutEntity = EntityInstance & PlayerTimeoutStruct
