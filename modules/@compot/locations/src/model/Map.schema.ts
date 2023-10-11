import MapCoordsSchema from "./MapCoords.schema";

export default {
    type: "object",
    properties: {
        name: { type: "string", format: "slug" },
        type: { type: "string", enum: ["map", "image"] },
        href: { type: "string", format: "url" },
        range: {
            type: "object",
            additionalProperties: false,
            properties: {
                min: MapCoordsSchema,
                max: MapCoordsSchema,
            },
        },
    },
} as const
