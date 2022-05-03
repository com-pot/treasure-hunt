import { defineConditionType } from "../../../typeful-executive/executive";

type Evaluator = (a: any, b: any) => boolean
const evaluators: Record<string, Evaluator> = {
    eq: (a, b) => a === b,
    neq: (a, b) => a !== b,

    lt: (a, b) => a < b,
    lte: (a, b) => a <= b,
    gt: (a, b) => a > b,
    gte: (a, b) => a >= b,
}

export default defineConditionType({
    arguments: {
        operator: {
            type: 'string', enum: ['eq', 'neq', 'lt', 'lte', 'gt', 'gte'],
        },
        time: {
            type: 'time',
        },
    },

    evaluate: async (tfa, ctx, args, onError) => {
        if (!args.time) {
            onError?.('invalid-arguments', {invalidKeys: {time: 'time-missing'}})
            return false
        }

        const time = new Date(args.time as number)

        const evaluator = evaluators[args.operator as string]
        if (!evaluator) {
            onError?.('invalid-argument', {invalidKeys: {operator: 'unknown-operator'}})
            return false
        }

        return evaluator(ctx.moment.getTime(), time.getTime())
    },
})
