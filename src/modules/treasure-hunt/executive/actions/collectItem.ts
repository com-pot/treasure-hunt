import { defineActionType } from "../../../typeful-executive/executive";
import { PlayerEntity } from "../../model/player";
import { PlayerService } from "../../model/player.service";

export default defineActionType({
    arguments: {
        itemName: {type: 'string'},
    },

    execute: async (tfa, ctx, args, onError) => {
        const playerService = tfa.getModel<PlayerService>('treasure-hunt.player')
        await playerService.collectItem(ctx, ctx.player as PlayerEntity, args.itemName as string)
    },
})
