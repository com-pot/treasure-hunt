import { defineConditionType } from "../../../typeful-executive/executive";
import { PlayerEntity } from "../../model/player";
import { PlayerProgressionEntity } from "../../model/player-progression";

export default defineConditionType({
    arguments: {
        part: {type: 'relation', target: 'treasure-hunt.story-part'},
        interaction: {type: 'string', required: false, enum: ['reveal'] },
    },

    evaluate: async (tfa, ctx, args, onError) => {
        const player = ctx.player as PlayerEntity
        if (!player) {
            console.log(ctx);

            onError?.('invalid-context', {missing: 'player'})
            return false
        }

        const storyPartKey = args.clue as string
        if (!storyPartKey) {
            onError?.('invalid-arguments', {invalidKeys: {part: 'part-missing'}})
            return false
        }

        const playerProgressionDao = tfa.getDao<PlayerProgressionEntity>('treasure-hunt.player-progression')
        const progression = await playerProgressionDao.findOne(ctx, {
            player, storyPart: storyPartKey,
        })

        if (!progression) {
            return false
        }

        return true
    },
})
