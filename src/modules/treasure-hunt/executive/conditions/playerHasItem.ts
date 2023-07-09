import { defineConditionType } from "../../../typeful-executive/executive";
import player, { PlayerEntity } from "../../model/player";

export default defineConditionType({
    argumentsSchema: {
        type: "object",
        properties: {
            itemName: {type: 'string'},
            anyOf: {
                type: 'array',
                items: {type: 'string'},
            },
            allOf: {
                type: 'array',
                items: {type: 'string'},
            },
        },
    },
    evaluate: (tfa, ctx, args, onError) => {
        const player = ctx.player as PlayerEntity
        if (!player) {
            onError?.('invalid-context', {missing: 'player'})
            return false
        }
        const evaluators: ItemPresenceEvaluator[] = []
        if (args.itemName && typeof args.itemName === 'string') {
            evaluators.push(itemPresenceEvaluators.itemName(args.itemName))
        }
        if (Array.isArray(args.anyOf) && args.anyOf.length) {
            evaluators.push(itemPresenceEvaluators.anyOf(args.anyOf))
        }
        if (Array.isArray(args.allOf) && args.allOf.length) {
            evaluators.push(itemPresenceEvaluators.allOf(args.allOf))
        }
        if (!evaluators.length) {
            onError?.('invalid-arguments', {reason: 'no-spec-present', expectedProps: ['itemName', 'anyOf', 'allOf']})
            return false
        }

        if (!player.itemBag || !Array.isArray(player.itemBag)) {
            return false
        }

        return evaluators.every((evaluator) => evaluator(player.itemBag!))
    },
})

type ItemPresenceEvaluator = (itemBag: string[]) => boolean
const itemPresenceEvaluators = {
    itemName: (itemName: string): ItemPresenceEvaluator => {
        return (playerBag) => playerBag.includes(itemName)
    },
    anyOf: (items: string[]): ItemPresenceEvaluator => {
         return (playerBag) => items.some((itemName) => playerBag.includes(itemName))
    },
    allOf: (items: string[]): ItemPresenceEvaluator => {
        return (playerBag) => items.every((itemName) => playerBag.includes(itemName))
    },
}
