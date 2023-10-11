export default {
    type: "object",
    properties: {
        activity: {type: "relation", target: "@compot/schedule.Activity"},
        location: {type: "relation", target: "@compot/locations.Place"},

        day: {type: "number"},
        start: {type: "string", format: "time"},
        end: {type: "string", format: "time"},

        params: {
            type: "object",
            additionalProperties: true,
            format: "json",
        },
        description: {type: "string"},
    },
    required: [
        "activity",
    ],
}
