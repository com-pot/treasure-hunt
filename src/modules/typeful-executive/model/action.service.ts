import { ObjectId } from "mongodb";
import AppError from "../../../app/AppError";
import { ActionContext } from "../../../app/middleware/actionContext";
import ModelService from "../../typeful/services/ModelService";
import { defineModelServiceFactory } from "../../typeful/typeful";
import { ActionTypeController, ConditionEvaluationErrorHandler } from "../executive";
import { ActionStruct } from "./action";

export const create = defineModelServiceFactory((tfa, fqn) => {
    return {
        ...ModelService.create(tfa, fqn),

        async executeAction<TOut=any>(ctx: ActionContext, action: ActionStruct, onError?: ConditionEvaluationErrorHandler): Promise<TOut> {
            // for now, the _id is required for typing as static daos are not entirely
            const actionTypesDao = tfa.getDao<ActionTypeController & {_id: ObjectId}>('typeful-executive.action-type')
            const actionController = await actionTypesDao.findOne(ctx, action.type)
            if (!actionController) {
                onError?.('action-controller-not-implemented', {type: action.type})
                throw new AppError('action-controller-not-implemented', 501, {controller: action.type})
            }

            return await actionController.execute(tfa, ctx, action.arguments, onError)
        },
    }
})

export type ActionModelService = ReturnType<typeof create>
