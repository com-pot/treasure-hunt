export default {
    type: 'schema',
    fields: {
        since: {type: 'date'},
        until: {type: 'date'},
        clearedAt: {type: 'date'},
        clearedBy: {type: 'relation', target: 'auth.user'},
    },
}
