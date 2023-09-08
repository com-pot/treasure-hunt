import { ActionContext } from "../../../app/middleware/actionContext";
import ModelService from "../../typeful/services/ModelService";
import { defineModelPluginFactory, EntityRef } from "../../typeful/typeful";
import { PlayerEntity } from "./player";
import { StoryEntity } from "./story";
import { TrophyEntity } from "./trophy";

export const create = defineModelPluginFactory((tfa, spec) => {
    return {
        ...ModelService.create<TrophyEntity>(tfa, spec),

        async ensurePlayerHasTrophy(ctx: ActionContext, player: PlayerEntity, story: EntityRef<StoryEntity>): Promise<TrophyEntity> {
            let trophy = await this.dao.findOne(ctx, {player, story})
            if (!trophy) {
                trophy = await this.dao.create(ctx, {
                    player: player._id,
                    story: player.story,
                    order: await this.dao.count(ctx, {story}) + 1
                })
            }

            return trophy
        },
    }
})

export type TrophyService = ReturnType<typeof create>
