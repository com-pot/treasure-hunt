import AppError from "../../../app/AppError";
import { ActionContext } from "../../../app/middleware/actionContext";
import ModelService from "../../typeful/services/ModelService";
import TypefulAccessor from "../../typeful/services/TypefulAccessor";

export const create = (tfa: TypefulAccessor, model: string) => {
    return {
        ...ModelService.create(tfa, model),

        async getProgression(action: ActionContext, player: any): Promise<any[]> {
            let progression = (await this.dao.list!(action, {player})).items
        
        
            if (!progression.length) {
                const firstStoryPart = await tfa.getDao('treasure-hunt.story-part').findOne!(action, {story: player.story, order: 1})
                if (!firstStoryPart) {
                    throw new AppError("story-not-available", 503, {story: player.story, order: 1})
                }
                
                await this.dao.create!(action, {
                    player: player._id,
                    storyPart: firstStoryPart._id,
                    status: 'new',
                    challengeData: null,
                })
                
                progression = (await this.dao.list!(action, {player})).items
            }

            return progression
        }
    }
}

export type PlayerProgressionService = ReturnType<typeof create>
