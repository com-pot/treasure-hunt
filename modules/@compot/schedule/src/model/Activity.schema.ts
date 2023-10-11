export default {
    type: "object",
    properties: {
        slug: {type: "string", format: "slug", minLength: 1},
        meet: {type: "relation", target: "@compot/meets.Meet"},

        title: {
            type: "object",
            additionalProperties: { type: "string" },
            "x-i18n": "map",
        },
        description: {
            type: "object",
            additionalProperties: { type: "string", "x-multiline": true },
            "x-i18n": "map",
        },
    },
}
