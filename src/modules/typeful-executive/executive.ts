import { ActionContext } from "../../app/middleware/actionContext"
import TypefulAccessor from "../typeful/services/TypefulAccessor"

type SchemaFieldSpec = {
    type: string,
    [param: string]: unknown,
}
export type ConditionEvaluationErrorHandler = (type: string, data: Record<string, unknown>) => void

export type ConditionTypeController = {
    name: string,
    argumentsSchema?: SchemaFieldSpec & {type: "object"},

    evaluate: (tfa: TypefulAccessor, ctx: ActionContext, args: Record<string, unknown>, onError?: ConditionEvaluationErrorHandler) => boolean|Promise<boolean>,
}

export type ConditionTypeSpec = Omit<ConditionTypeController, 'name'>
export const defineConditionType = <T extends ConditionTypeSpec>(type: T): T => type

export type ActionTypeController<TArgs extends object = Record<string, unknown>, TOut = any> = {
    name: string,
    argumentsSchema?: SchemaFieldSpec & {type: "object"},

    execute: (tfa: TypefulAccessor, ctx: ActionContext, args: TArgs, onError?: ConditionEvaluationErrorHandler) => TOut|Promise<TOut>,
}

export type ActionTypeSpec = Omit<ActionTypeController, 'name'>
export const defineActionType = <T extends ActionTypeSpec>(type: T): T => type

export type ExecutiveModule = {
    conditionTypes?: Record<string, ConditionTypeSpec>,
    actionTypes?: Record<string, ActionTypeSpec>
}
export const defineExecutiveModule = <T extends ExecutiveModule>(module: T): T => module
