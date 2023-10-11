import MapCoordsSchema from "./MapCoords.schema";

export default {
    type: "object",
    properties: {
        slug: { type: "string", format: "slug", minLength: 1 },

        title: {
            type: "object",
            additionalProperties: { type: "string" },
            "x-i18n": "map",
        },

        location: {
            type: "object",
            properties: {
                map: { type: "relation", target: "@compot/locations.Map" },
                center: MapCoordsSchema,
            },
        },
    },
}
