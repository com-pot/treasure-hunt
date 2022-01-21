import { ObjectId } from "mongodb"
import { ActionContext } from "../../../../app/middleware/actionContext"
import { EntityInstance } from "../../typeful"

export type ArgumentValue = number|string|ObjectId
export type FilterCriteria = ArgumentValue | MatchArg | MatchArg[]
export type SortOrder = Record<string, 1|-1>
export type Pagination = {
    page: number,
    perPage: number,
    totalItems: number,
}
export type PaginationParam = Omit<Pagination, 'totalItems'>

export type MatchObjectInfer = Record<string, string|number|object>
/** [field, operator] | [field, operator, argument] */
export type MatchOperatorArgument = [string, string] | [string, string, ArgumentValue|ArgumentValue[]]
export type MatchArg = MatchObjectInfer | MatchOperatorArgument
export const isMatchOperatorArg = (subject: unknown): subject is MatchOperatorArgument => {
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
export type CreateRequest<T> = Partial<T>


export interface DaoStrategy {
    type: string,
    primaryKey?: string,
}

export type ListResult<T> = {
    page: number,
    total: number,
    items: T[],
}

export interface Dao<T extends EntityInstance = EntityInstance> {
    list(action: ActionContext, filter?: FilterCriteria, sort?: SortOrder, pagination?: PaginationParam): Promise<ListResult<T>>
    count(action: ActionContext, filter?: FilterCriteria): Promise<number>
    aggregate<TAggr=unknown>(action: ActionContext, aggregate: AggregationTask[]): Promise<TAggr[]>

    findOne(action: ActionContext, filter?: FilterCriteria): Promise<T>

    create(action: ActionContext, data: CreateRequest<T>): Promise<T>
    update(action: ActionContext, query: FilterCriteria, data: Partial<T>): Promise<T>

    delete(action: ActionContext, query: FilterCriteria): Promise<boolean|{result: string}>
}
