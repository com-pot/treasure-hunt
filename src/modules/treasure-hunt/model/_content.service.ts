import { ActionContext } from "../../../app/middleware/actionContext"
import { ConditionModelService } from "../../typeful-executive/model/condition.service"
import TypefulAccessor from "../../typeful/services/TypefulAccessor"
import { TreasureHuntContentBlockEntity } from "./_content"

export const create = (tfa: TypefulAccessor) => {
    return {
        async filterVisibleBlocks(ctx: ActionContext, blocksSpec: TreasureHuntContentBlockEntity[]): Promise<TreasureHuntContentBlockEntity[]> {
            const conditionService = tfa.getModel<ConditionModelService>('typeful-executive.condition')

            const contentBlocksConcealed = await Promise.all(blocksSpec.map(async (block) => {
                if (!block.if) {
                    return block
                }
                const isMet = await conditionService.evaluateCondition(ctx, block.if, (err, data) => {
                    console.warn("Error during condition evaluation: ", err, data)
                })

                return isMet ? block : null
            }))

            return contentBlocksConcealed.filter((block) => (block)) as TreasureHuntContentBlockEntity[]
        },
    }
}

export type TreasureHuntContentService = ReturnType<typeof create>
