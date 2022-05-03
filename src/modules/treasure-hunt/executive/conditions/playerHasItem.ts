import { defineConditionType } from "../../../typeful-executive/executive";
import { PlayerEntity } from "../../model/player";

export default defineConditionType({
    arguments: {
        itemName: {type: 'string'},
    },
    evaluate: (tfa, ctx, args, onError) => {
        const player = ctx.player as PlayerEntity
        if (!player) {
            onError?.('invalid-context', {missing: 'player'})
            return false
        }

        const itemName = args.itemName as string
        if (!itemName || typeof itemName !== 'string') {
            onError?.('invalid-arguments', {invalidKeys: {itemName: 'not-a-string'}})
            return false
        }

        if (!player.itemBag || !Array.isArray(player.itemBag)) {
            return false
        }

        return player.itemBag.includes(itemName)
    },
})
