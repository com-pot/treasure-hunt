import { defineActionType } from "../../../typeful-executive/executive"

export default defineActionType({
    arguments: {
        duration: {type: 'number', description: "Duration in seconds"},
    },

    execute: async (tfa, ctx, args, onError) => {
        return { type: 'timeout', duration: args.duration }
    },
})
