export default {
    type: "object",
    properties: {
        slug: { type: "string", format: "slug", minLength: 1 },

        title: {
            type: "object",
            additionalProperties: { type: "string" },
            "x-i18n": "map",
        },
        homepage: { type: "string", format: "url" },
        description: {
            type: "object",
            additionalProperties: { type: "string", "x-multiline": true },
            "x-i18n": "map",
        },
    },
    required: [
        "title",
    ],
}
