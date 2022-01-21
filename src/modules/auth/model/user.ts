import { EntityInstance } from "../../typeful/typeful"

const loginMethod = {
    type: 'schema',
    fields: {
        type: {type: 'string'},
        options: {type: 'json'},
    },
}

export default {
    type: 'schema',
    fields: {
        login: {type: 'string'},
        email: {type: 'string', mode: 'email'},
        loginMethods: {
            type: 'list',
            innerType: loginMethod,
        },
    },
}

export type UserEntity = EntityInstance & {
    login: string,
    loginMethods?: {
        type: string,
        [opt: string]: any, // eslint-disable-line @typescript-eslint/no-explicit-any
    }[]
    roles?: string[]
}
