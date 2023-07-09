import { defineConditionType } from "../../../typeful-executive/executive";
import { PlayerEntity } from "../../model/player";
import { PlayerProgressionService } from "../../model/player-progression.service";

export default defineConditionType({
    argumentsSchema: {
        type: "object",
        properties: {
            status: {
                type: 'string',
                enum: ['any', 'cleared'],
            },
        },
        required: ["status"],
    },
    evaluate: async (tfa, ctx, args, onError) => {
        const player = ctx.player as PlayerEntity
        if (!player) {
            onError?.('invalid-context', {missing: 'player'})
            return false
        }

        const progressionService = tfa.getModel<PlayerProgressionService>('treasure-hunt.player-progression')

        if (args.status === 'cleared') {
            const timeouts = await progressionService.findTimeouts(ctx, player)
            if (!timeouts.length) {
                return false
            }
        }

        const activeTimeouts = await progressionService.findActiveTimeouts(ctx, player)

        return !activeTimeouts.length
    },
})
