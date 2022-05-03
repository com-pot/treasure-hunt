import { defineActionType } from "../../../typeful-executive/executive";
import { PlayerEntity } from "../../model/player";
import { PlayerProgressionEntity } from "../../model/player-progression";
import { PlayerProgressionService } from "../../model/player-progression.service";
import { StoryPartService } from "../../model/story-part.service";
import { TrophyEntity } from "../../model/trophy";
import { TrophyService } from "../../model/trophy.service";

export default defineActionType({
    arguments: {
        slug: {type: 'relation', target: 'treasure-hunt.story-part'},
    },
    execute: async (tfa, ctx, args) => {
        const storyPartsService = tfa.getModel<StoryPartService>('treasure-hunt.story-part')
        const progressionService = tfa.getModel<PlayerProgressionService>('treasure-hunt.player-progression')

        const storyPart = await storyPartsService.dao.findOne(ctx, {slug: args.slug as string})
        if (!storyPart) {
            return
        }
        const player = ctx.player as PlayerEntity

        const order = storyPart.order + 1
        const nextStoryPart = await storyPartsService.dao.findOne(ctx, {story: player.story, order})

        const result: CompleteStoryPartResult = {}
        if (nextStoryPart) {
            result.unlockedProgression = await progressionService.ensureProgressionExists(ctx, player, nextStoryPart)

            const count = await storyPartsService.dao.count(ctx, {story: player.story})
            if (order === count) {
                const trophies = tfa.getModel<TrophyService>('treasure-hunt.trophy')
                result.trophy = await trophies.ensurePlayerHasTrophy(ctx, player, player.story)
            }
        }

        return result
    },
})

export type CompleteStoryPartResult = {
    trophy?: TrophyEntity,
    unlockedProgression?: PlayerProgressionEntity,
}
