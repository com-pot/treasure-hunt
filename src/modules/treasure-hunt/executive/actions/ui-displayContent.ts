import { defineActionType } from "../../../typeful-executive/executive";

// FIXME: this model is potentialy dangerous
export default defineActionType({
    arguments: {
        template: {type: 'string'},
        args: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    type: {type: 'string'},
                    arguments: {type: 'string'},
                },
            },
        },
    },
    execute: (tfa, ctx, args) => {
        return {
            ...args,
        }
    },
})
