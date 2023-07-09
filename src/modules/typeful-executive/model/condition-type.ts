export default {
    type: 'object',
    properties: {
        name: {type: 'string'},
        argumentsSchema: { type: "object", additionalProperties: true, format: "json" },
    },
}
