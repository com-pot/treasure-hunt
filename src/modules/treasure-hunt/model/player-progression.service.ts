import AppError from "../../../app/AppError";
import { ActionContext } from "../../../app/middleware/actionContext";
import ModelService from "../../typeful/services/ModelService";
import TypefulAccessor from "../../typeful/services/TypefulAccessor";
import { PlayerEntity } from "./player";
import { PlayerProgressionEntity } from "./player-progression";
import { StoryPartEntity } from "./story-part";

export const create = (tfa: TypefulAccessor, model: string) => {
    return {
        ...ModelService.create<PlayerProgressionEntity>(tfa, model),

        async getProgression(action: ActionContext, player: PlayerEntity): Promise<PlayerProgressionEntity[]> {
            let progression = (await this.dao.list(action, {player}, undefined, {page: 1, perPage: 1000})).items


            if (!progression.length) {
                const storyPartsCollection = tfa.getDao('treasure-hunt.story-part')
                const firstStoryPart = await storyPartsCollection.findOne(action, {story: player.story, order: 1})
                if (!firstStoryPart) {
                    throw new AppError("story-not-available", 503, {story: player.story, order: 1})
                }

                await this.dao.create(action, {
                    player: player._id,
                    storyPart: firstStoryPart._id,
                    status: 'new',
                })

                progression = (await this.dao.list(action, {player})).items
            }

            return progression
        },

        async ensureProgressionExists(ctx: ActionContext, player: PlayerEntity, storyPart: StoryPartEntity): Promise<PlayerProgressionEntity> {
            let progressionItem = await this.dao.findOne(ctx, {player, storyPart})
            console.log('ensureProgressionExists', storyPart.slug, progressionItem);

            if (!progressionItem) {
                progressionItem = await this.dao.create(ctx, {
                    player: player._id,
                    storyPart: storyPart._id,
                    status: 'new',
                    data: null,
                })
            }

            return progressionItem
        },

        async findActiveTimeouts(ctx: ActionContext, player: PlayerEntity): Promise<PlayerProgressionEntity[]> {
            const list = await this.dao.list(ctx, {
                player,
                '!timeout': null,
            })
            let items = list.items.filter((item) => {
                if (!item.timeout) {
                    return false
                }
                if (item.timeout.until <= ctx.moment) {
                    return false
                }

                return true
            })
            return items
        },

        async findTimeouts(ctx: ActionContext, player: PlayerEntity): Promise<PlayerProgressionEntity[]> {
            const list = await this.dao.list(ctx, {
                player,
                '!timeout': null,
            })
            let items = list.items.filter((item) => {
                if (!item.timeout) {
                    return false
                }

                return true
            })
            return items
        },
    }
}

export type PlayerProgressionService = ReturnType<typeof create>
