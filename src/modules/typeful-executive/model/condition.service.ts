import { ObjectId } from "mongodb";
import { ActionContext } from "../../../app/middleware/actionContext";
import ModelService from "../../typeful/services/ModelService";
import { defineModelPluginFactory } from "../../typeful/typeful";
import { ConditionEvaluationErrorHandler, ConditionTypeController } from "../executive";
import { ConditionEntity } from "./condition";

export const create = defineModelPluginFactory((tfa, spec) => {
    return {
        ...ModelService.create<ConditionEntity>(tfa, spec),

        /**
         * Evaluates condition using its argument and given action context
         *
         * Returns condition.shouldBeMet === evaluate
         *
         * @param action
         * @param condition
         * @param onError
         * @returns
         */
        async evaluateCondition(action: ActionContext, condition: ConditionEntity, onError?: ConditionEvaluationErrorHandler): Promise<boolean> {
            // for now, the _id is required for typing as static daos are not entirely
            const conditionTypesDao = tfa.getDao<ConditionTypeController & {_id: ObjectId}>('typeful-executive.condition-type')
            const conditionController = await conditionTypesDao.findOne(action, condition.type)
            if (!conditionController) {
                onError?.('condition-controller-not-implemented', {type: condition.type})
                return false
            }

            const isMet = await conditionController.evaluate(tfa, action, condition.arguments, onError)
            const shouldBeMet = condition.shouldBeMet !== false

            return isMet === shouldBeMet
        },
    }
})

export type ConditionModelService = ReturnType<typeof create>
