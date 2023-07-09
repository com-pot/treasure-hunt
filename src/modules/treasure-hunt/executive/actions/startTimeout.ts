import { defineActionType } from "../../../typeful-executive/executive"

export default defineActionType({
    argumentsSchema: {
        type: "object",
        properties: {
            duration: {
                type: 'number', description: "Duration in seconds",
                minimum: 1,
            },
        },
        required: ["duration"],
    },

    execute: async (tfa, ctx, args, onError) => {
        return { type: 'timeout', duration: args.duration }
    },
})
