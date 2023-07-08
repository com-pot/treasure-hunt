export default {
    type: 'object',
    properties: {
        type: {type: 'string'},
        params: {
            type: 'object',
            additionalProperties: {
                type: "string",
                "x-enum": "data-type",
            },
        },
    },
}
