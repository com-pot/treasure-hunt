export default {
    type: 'schema',
    fields: {
        title: {type: 'string'},
            authors: {
            type: 'list',
            innerType: {
                type: 'relation',
                target: 'directory.person',
            },
        },
    },
}
