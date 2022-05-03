import { defineActionType } from "../../../typeful-executive/executive";

// FIXME: this model is potentialy dangerous
export default defineActionType({
    arguments: {
        template: {type: 'string'},
        args: {
            type: 'list',
            innerType: {
                type: 'schema',
                fields: {
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
