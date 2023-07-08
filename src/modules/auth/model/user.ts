import { EntityInstance } from "../../typeful/typeful"

const loginMethod = {
    type: 'object',
    properties: {
        type: {type: 'string'},
        options: {type: 'object', additionalProperties: true, format: "json"},
    },
}

export default {
    type: 'object',
    properties: {
        login: {type: 'string'},
        email: {type: 'string', mode: 'email'},
        loginMethods: {
            type: 'array',
            items: loginMethod,
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
