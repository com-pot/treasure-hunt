import { ActionContext } from "../../../../app/middleware/actionContext"
import { PaginatedList } from "../../model/list"
import { EntityInstance, EntityRef } from "../../typeful"

export { PaginatedList }

export type ArgumentValue = number | string | boolean | null | string[] | number[] | EntityRef | EntityRef[] | EntityInstance
export type MatchObjectInfer = Record<string, ArgumentValue|Record<string, ArgumentValue>|Record<string, ArgumentValue>[]>
/** [field, operator] | [field, operator, argument] */
export type MatchOperatorArgument = [string, string] | [string, string, ArgumentValue]

export type FilterCriteria = ArgumentValue | MatchObjectInfer | MatchOperatorArgument[]
export type SortOrder = Record<string, 1|-1>
export type Pagination = {
    page: number,
    perPage: number,
    totalItems: number,
}
export type PaginationParam = Omit<Pagination, 'totalItems'>

export const isMatchOperator = (subject: unknown): subject is MatchOperatorArgument[] => {
    return Array.isArray(subject) && subject.every((item) => isMatchOperatorArg(item))
}
export const isMatchOperatorArg = (subject: unknown): subject is MatchOperatorArgument => {
    if (!Array.isArray(subject)) {
        return false
    }
    return typeof subject[0] === 'string' && typeof subject[1] === 'string'
}

export type MatchAggregation = {
    type: 'match',
    match: MatchOperatorArgument[] | MatchObjectInfer,
}
type FieldAccumulator = {op: string, arg?: string}

export type GroupAggregation = {
    type: 'group',
    by: string|string[],
    add?: Record<string, FieldAccumulator>
}
export type AggregationTask = MatchAggregation | GroupAggregation
export type CreateRequest<T> = Partial<T>


export interface Dao<T extends EntityInstance = EntityInstance> {
    list(action: ActionContext, filter?: FilterCriteria, sort?: SortOrder, pagination?: PaginationParam): Promise<PaginatedList<T>>
    count(action: ActionContext, filter?: FilterCriteria): Promise<number>
    aggregate<TAggr=unknown>(action: ActionContext, aggregate: AggregationTask[]): Promise<TAggr[]>

    findOne(action: ActionContext, filter?: FilterCriteria): Promise<T|null>

    create(action: ActionContext, data: CreateRequest<T>): Promise<T>
    update(action: ActionContext, query: FilterCriteria, data: Partial<T>): Promise<T>

    delete(action: ActionContext, query: FilterCriteria): Promise<boolean|{result: string}>
}
