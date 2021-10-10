import { ActionContext } from "../../../../app/middleware/actionContext"

export type FilterCriteria = number | string | MatchArg | MatchArg[]
export type SortOrder = any // TODO: specify sorting
export type Pagination = {
    page: number,
    perPage: number,
    totalItems: number,
}
export type PaginationParam = Omit<Pagination, 'totalItems'>

export type MatchObjectInfer = Record<string, any>
/** [field, operator] | [field, operator, argument] */
export type MatchOperatorArgument = [string, string] | [string, string, string]
export type MatchArg = MatchObjectInfer | MatchOperatorArgument
export const isMatchOperatorArg = (subject: any): subject is MatchOperatorArgument => {
    if (!Array.isArray(subject)) {
        return false
    }
    return typeof subject[0] === 'string' && typeof subject[1] === 'string'
}

export type MatchAggregation = {
    type: 'match',
    match: MatchArg[]
}
type FieldAccumulator = {op: string, arg?: string}

export type GroupAggregation = {
    type: 'group',
    by: string|string[],
    add?: Record<string, FieldAccumulator>
}
export type AggregationTask = MatchAggregation | GroupAggregation
export type CreateRequest<T> = T|any


export interface DaoStrategy {
    type: string,
    primaryKey?: string,
}

export type ListResult<T> = {
    page: number,
    total: number,
    items: T[],
}

export interface Dao<T=any> {
    list?(action: ActionContext, filter?: FilterCriteria, sort?: SortOrder, pagination?: PaginationParam): Promise<ListResult<T>>
    count?(action: ActionContext, filter?: FilterCriteria): Promise<number>
    aggregate?<TAggr=any>(action: ActionContext, aggregate: AggregationTask[]): Promise<TAggr[]>

    findOne?(action: ActionContext, filter?: FilterCriteria): Promise<T>

    create?(action: ActionContext, data: CreateRequest<T>): Promise<T>
    update?(action: ActionContext, query: FilterCriteria, data: T): Promise<T>

    delete?(action: ActionContext, query: FilterCriteria): Promise<boolean|{result: string}>
}
