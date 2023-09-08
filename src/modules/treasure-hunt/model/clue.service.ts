import { ActionContext } from "../../../app/middleware/actionContext";
import { ActionModelService } from "../../typeful-executive/model/action.service";
import { ConditionModelService } from "../../typeful-executive/model/condition.service";
import ModelService from "../../typeful/services/ModelService";
import { defineModelPluginFactory } from "../../typeful/typeful";
import { ClueEntity } from "./clue";
import { PlayerEntity } from "./player";
import { StoryPartService } from "./story-part.service";
import { TreasureHuntContentService } from "./_content.service";

export const create = defineModelPluginFactory((tfa, spec) => {
    return {
        ...ModelService.create<ClueEntity>(tfa, spec),

        async revealClue(action: ActionContext, clue: ClueEntity): Promise<ClueEntityWithResults> {
            const storyPartsService = tfa.getModel<StoryPartService>('treasure-hunt.story-part')
            const progressAwareClue = await storyPartsService.checkChaseClue(action, action.player as PlayerEntity, clue)

            const revealedClue: ClueEntityWithResults = {
                ...progressAwareClue,
                revealResults: [],
            }

            const actionService = tfa.getModel<ActionModelService>('typeful-executive.action')
            const conditionService = tfa.getModel<ConditionModelService>('typeful-executive.condition')

            for (let revealAction of clue.onReveal || []) {
                if (revealAction.if) {
                    const conditionMet = await conditionService.evaluateCondition(action, revealAction.if)

                    if (!conditionMet) {
                        continue
                    }
                }
                const result = await actionService.executeAction(action, revealAction)

                result && revealedClue.revealResults.push(result)
            }

            return revealedClue
        },
        async preparePlayerClue(action: ActionContext, player: PlayerEntity, clue: ClueEntity) {
            const contentService = tfa.getModel<TreasureHuntContentService>('treasure-hunt._content')

            clue.contentBlocks = await contentService.filterVisibleBlocks({...action, player}, clue.contentBlocks)
            return clue
        },
    }
})

type ClueEntityWithResults = ClueEntity & {
    revealResults: any[],
}

export type ClueService = ReturnType<typeof create>
