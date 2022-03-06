import { Filter, Document, Condition, ObjectId } from "mongodb"
import AppError from "../../../../app/AppError"
import { EntityConfigEntry } from "../EntityRegistry"
import { isEntityInstance } from "../SchemaService"
import { AggregationTask, FilterCriteria, GroupAggregation, isMatchOperator, MatchAggregation, MatchObjectInfer, MatchOperatorArgument } from "./Daos"

export const filter = (findBy: FilterCriteria|undefined, config: EntityConfigEntry): Filter<Document> => {
    const $match: Filter<Document> = {}

    if (findBy === undefined || findBy === null) {
        return $match
    }

    if (isMatchOperator(findBy)) {
        findBy.forEach((arg) => parseArrFilter($match, arg))
        return $match
    }

    if (typeof findBy === 'object' && !Array.isArray(findBy) && !(findBy instanceof ObjectId) && !isEntityInstance(findBy)) {
        Object.entries(findBy)
            .forEach(([field, args]) => createCondition($match, field, args))

        return $match
    }

    const field = config.strategy.primaryKey || 'id'
    createCondition($match, field, findBy)

    return $match
}

// This function is potentially dangerous if we allow group argument to come from user
export const group = (group: GroupAggregation) => {
    const _id = typeof group.by === 'string'
        ? '$' + group.by
        : group.by.map((prop) => '$' + prop)

    const groupTask: Document = {_id}
    if (group.add) {
        Object.entries(group.add).forEach(([name, accumulator]) => {
            groupTask[name] = {['$' + accumulator.op]: accumulator.arg || {}}
        })
    }

    return groupTask
}

export const prepareAggregationPipeline = (config: EntityConfigEntry, aggregate: AggregationTask[]): Document[] => {
    return aggregate.map((task) => {
        const taskFactory = aggregationTaskMap[task.type]
        if (!taskFactory) {
            throw new Error('Unknown aggregate type')
        }


        return taskFactory(config, task)
    })
}


export default {
    prepareAggregationPipeline,

    filter,
    group,
}


type SinglePolarityCondFactory = (args: unknown) => Condition<unknown>
type PolarizedCondFactory = (args: unknown, polarity: boolean) => Condition<unknown>
type CondFactory = SinglePolarityCondFactory | PolarizedCondFactory

const operatorToCondMappers: Record<string, CondFactory> = {
    in: (args, polarity) => polarity ? ({$in: args}) : ({$nin: args}),
    nin: (args, polarity) => polarity ? ({$nin: args}) : ({$in: args}),

    eq: (args, polarity) => polarity ? ({$eq: args}) : ({$ne: args}),
    ne: (args, polarity) => polarity ? ({$ne: args}) : ({$eq: args}),
}

type Aggregation = Record<string, unknown>
type AggregationFactory = (config: EntityConfigEntry, task: AggregationTask) => Aggregation
const aggregationTaskMap: Record<string, AggregationFactory> = {
    match: (config, task) => ({$match: filter((task as MatchAggregation).match, config)}),
    group: (config, task) => ({$group: group(task as GroupAggregation)}),
}

const sanitizeArgs = (args: unknown): unknown => {
    if (Array.isArray(args)) {
        return args.map((arg) => sanitizeArgs(arg))
    }

    if (args && typeof args === 'object') {
        const obj = args as Record<string, unknown>
        if (obj._id) {
            return obj._id
        }
    }

    return args
}
const createCondition = ($match: Filter<Document>, field: string, args: unknown, op?: string): Condition<unknown> => {
    if (!op) {
        op = inferOperatorByArg(args)
    }

    const conditionFn = operatorToCondMappers[op]
    if (!conditionFn) {
        throw new AppError('unsupported-operator', undefined, {field, op})
    }

    const polarity = field.charAt(0) !== '!'
    if (!polarity) {
        field = field.substring(1)
    }

    const argsSanitized = sanitizeArgs(args)
    let condition = conditionFn(argsSanitized, polarity)

    if (conditionFn.length < 2 && !polarity) {
        condition = {$not: condition}
    }

    $match[field] = condition
    return condition
}
const parseArrFilter = ($match: Filter<Document>, query: MatchOperatorArgument) => {
    if (query.length < 2) {
        throw new AppError('malformed-query', 400, {query})
    }

    const [field, op, args] = query
    createCondition($match, field, args, op)
}
const inferOperatorByArg = (args: unknown) => {
    if (Array.isArray(args)) {
        return 'in'
    }
    return 'eq'
}
