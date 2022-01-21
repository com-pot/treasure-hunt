import { Filter, Document, Condition, ObjectId } from "mongodb"
import AppError from "../../../../app/AppError"
import { EntityConfigEntry } from "../EntityRegistry"
import { AggregationTask, FilterCriteria, GroupAggregation, isMatchOperatorArg, MatchAggregation, MatchObjectInfer, MatchOperatorArgument } from "./Daos"

export const filter = (findBy: FilterCriteria|undefined, config: EntityConfigEntry): Filter<Document> => {
    if (!findBy) {
        return {}
    }

    const $match: Filter<Document> = {}
    if (typeof findBy !== "object" || findBy instanceof ObjectId) {
        const field = config.strategy.primaryKey || 'id'
        createCondition($match, field, 'eq', findBy)
        return $match
    }
    if (Array.isArray(findBy)) {
        if (!findBy.length) {
            return $match
        }

        if (isMatchOperatorArg(findBy)) {
            parseArrFilter($match, findBy)
        } else {
            findBy.forEach((criteria) => Array.isArray(criteria) ? parseArrFilter($match, criteria) : parseObjectQuery($match, criteria))
        }

    } else {
        parseObjectQuery($match, findBy)
    }

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
const createCondition = ($match: Filter<Document>, field: string, op: string, args: unknown): Condition<unknown> => {
    const conditionFn = operatorToCondMappers[op]
    if (!conditionFn) {
        throw new AppError('unsupported-operator', undefined, {field, op})
    }

    let polarity = true
    if (field.charAt(0) === '!') {
        field = field.substring(1)
        polarity = false
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
    createCondition($match, field, op, args)
}
const inferOperatorByArg = (args: unknown) => {
    if (Array.isArray(args)) {
        return 'in'
    }
    return 'eq'
}
const parseObjectQuery = ($match: Filter<Document>, findBy: MatchObjectInfer) => {
    Object.entries(findBy).forEach(([field, args]) => {
        const op = inferOperatorByArg(args)
        createCondition($match, field, op, args)
    })
}
