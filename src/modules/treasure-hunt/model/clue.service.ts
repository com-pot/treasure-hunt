import { ActionContext } from "../../../app/middleware/actionContext";
import { ActionModelService } from "../../typeful-executive/model/action.service";
import ModelService from "../../typeful/services/ModelService";
import TypefulAccessor from "../../typeful/services/TypefulAccessor";
import { ClueEntity } from "./clue";
import { PlayerEntity } from "./player";
import { PlayerService } from "./player.service";
import { TreasureHuntContentService } from "./_content.service";

export const create = (tfa: TypefulAccessor, model: string) => {
    return {
        ...ModelService.create<ClueEntity>(tfa, model),

        async revealClue(action: ActionContext, clue: ClueEntity): Promise<ClueEntityWithResults> {
            const revealedClue: ClueEntityWithResults = {
                ...clue,
                revealResults: [],
            }

            const actionService = tfa.getModel<ActionModelService>('typeful-executive.action')
            for (let revealAction of clue.onReveal || []) {
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
}

type ClueEntityWithResults = ClueEntity & {
    revealResults: any[],
}

export type ClueService = ReturnType<typeof create>
