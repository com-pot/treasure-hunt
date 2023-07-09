import { defineActionType } from "../../../typeful-executive/executive";

// FIXME: this model potentialy leads to dangerous usage
//   with html insertion
export default defineActionType({
    argumentsSchema: {
        type: "object",
        properties: {
            template: {type: 'string'},
            args: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        type: {type: 'string'},
                        arguments: {type: 'string'},
                    },
                    required: ["type", "arguments"],
                },
            },
        },
        required: ["template", "args"],
    },
    execute: (tfa, ctx, args) => {
        return {
            ...args,
        }
    },
})
