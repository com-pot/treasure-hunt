export default {
    type: "object",
    properties: {
        id: { type: "string", format: "slug", minLength: 1 },

        meet: {type: "relation", target: "@compot/meets.Meet"},
        order: {type: "number"},

        content: {
            type: "object",
            additionalProperties: { type: "string", "x-multiline": true },
            "x-i18n": "map",
        },
        author: {
            type: "object",
            additionalProperties: { type: "string" },
            "x-i18n": "map",
        },
    },
    required: [
        "content",
        "author",
    ],
}
