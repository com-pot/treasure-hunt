import { defineConditionType } from "../../../typeful-executive/executive";
import { PlayerEntity } from "../../model/player";
import { PlayerProgressionService } from "../../model/player-progression.service";

export default defineConditionType({
    arguments: {

    },
    evaluate: async (tfa, ctx, args, onError) => {
        const player = ctx.player as PlayerEntity
        if (!player) {
            onError?.('invalid-context', {missing: 'player'})
            return false
        }

        const progressionService = tfa.getModel<PlayerProgressionService>('treasure-hunt.player-progression')
        const activeTimeouts = await progressionService.findActiveTimeouts(ctx, player)

        return !activeTimeouts.length
    },
})
