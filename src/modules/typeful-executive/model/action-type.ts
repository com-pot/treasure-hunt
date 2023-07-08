export default {
    type: 'object',
    properties: {
        name: {type: 'string'},
        arguments: { type: "object", additionalProperties: true, format: "json" },
    },
}
