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
