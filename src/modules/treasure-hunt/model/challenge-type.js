export default {
    type: 'schema',
    fields: {
        type: {type: 'string'},
        params: {
            type: 'map',
            innerType: 'type',
        },
    },
}
