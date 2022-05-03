import { defineConditionType } from "../../../typeful-executive/executive";
import { PlayerEntity } from "../../model/player";
import { PlayerProgressionEntity } from "../../model/player-progression";
import { StoryPartService } from "../../model/story-part.service";

export default defineConditionType({
    arguments: {
        part: {type: 'relation', target: 'treasure-hunt.story-part'},
        interaction: {type: 'string', required: false, enum: ['reveal'] },
    },

    evaluate: async (tfa, ctx, args, onError) => {
        const player = ctx.player as PlayerEntity
        if (!player) {
            onError?.('invalid-context', {missing: 'player'})
            return false
        }

        const storyPartKey = args.part as string
        if (!storyPartKey) {
            onError?.('invalid-arguments', {invalidKeys: {part: 'part-missing'}})
            return false
        }
        const storyPartService = tfa.getModel<StoryPartService>('treasure-hunt.story-part')
        const storyPart = await storyPartService.dao.findOne(ctx, {slug: storyPartKey})
        if (!storyPart) {
            onError?.('invalid-state', {invalidKeys: {part: 'part-missing'}})
            return false
        }

        const playerProgressionDao = tfa.getDao<PlayerProgressionEntity>('treasure-hunt.player-progression')
        const progression = await playerProgressionDao.findOne(ctx, {
            player, storyPart: storyPart._id,
        })

        if (!progression) {
            return false
        }
        if (args.interaction === 'reveal' || args.interaction === 'new') {
            return progression.status === 'new'
        }
        if (args.interaction === 'complete' || args.interaction === 'done') {
            return progression.status === 'done'
        }

        return true
    },
})
