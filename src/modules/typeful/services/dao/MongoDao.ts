import { get, merge } from "lodash"
import { MongoClient } from "mongodb"
import AppError from "../../../../app/AppError"

import { ActionContext } from "../../../../app/middleware/actionContext"
import { EntityInstance, UniqueConstraint } from "../../typeful"
import { EntityConfigEntry } from "../EntityRegistry"
import IntegrityService, { createValidationScope } from "../IntegrityService"
import { AggregationTask, CreateRequest, Dao, FilterCriteria, PaginatedList, PaginationParam, SortOrder } from "./Daos"
import mongoAggregators from "./mongoAggregators"

type MongoDaoHook<T> = (instance: T) => void | Promise<void>
type MongoDaoHooks<T> = {
    beforeSave: MongoDaoHook<T>,
}

export default class MongoDao<T extends EntityInstance> implements Dao<T> {

    private hooks: Partial<MongoDaoHooks<T>> = {}

    constructor(private readonly config: EntityConfigEntry, private mongoClient: MongoClient, private integrityService: IntegrityService) {

    }

    async list(action: ActionContext, filter?: FilterCriteria, sort?: SortOrder, pagination?: PaginationParam): Promise<PaginatedList<T>> {
        const page = pagination?.page || 1
        const perPage = pagination?.perPage || 10
        // FIXME: parameter validation shouldn't be handled at DAO level - move validation up
        if (page <= 0) {
            return Promise.reject(new AppError('invalid-arument', 400, {argument: 'page'}))
        }

        const query = mongoAggregators.filter(filter, this.config)
        const queryCursor = this.collection.find(query)
        if (!sort && this.config.defaultSort) {
            sort = this.config.defaultSort
        }
        if (sort) {
            queryCursor.sort(sort)
        }

        queryCursor.skip((page - 1) * perPage).limit(perPage)

        const items = await queryCursor.toArray() as T[]
        const totalItems = await this.collection.countDocuments(query)
        const totalPages = Math.ceil(totalItems / perPage)

        return {
            items,
            page,
            perPage,
            totalItems,
            totalPages,
        }
    }
    async count(action: ActionContext, filter?: FilterCriteria): Promise<number> {
        return this.collection.countDocuments(mongoAggregators.filter(filter, this.config))
    }
    async aggregate<TAggr>(action: ActionContext, aggregate: AggregationTask[]): Promise<TAggr[]> {
        const pipeline = mongoAggregators.prepareAggregationPipeline(this.config, aggregate)
        return this.collection.aggregate(pipeline).toArray() as Promise<TAggr[]>
    }

    async create(action: ActionContext, data: CreateRequest<T>) {
        const validationScope = createValidationScope()
        if (!this.integrityService.validate(this.config.schema, data, validationScope)) {
            throw new AppError('invalid-data', 400, {errors: validationScope.errors})
        }


        const sanitized = this.integrityService.sanitize(this.config.schema, data) as T

        const unmetUniquenessConstraints = await this.checkUnique(sanitized)
        if (unmetUniquenessConstraints && unmetUniquenessConstraints.length > 0) {
            throw new AppError('unique-constraint-violation', 409, {
                constraints: unmetUniquenessConstraints,
            })
        }

        sanitized.stats = {
            creator: action.actor,
            createdAt: action.moment,
            editor: action.actor,
            editedAt: action.moment,
        }

        if (this.hooks.beforeSave) {
            await this.hooks.beforeSave(sanitized)
        }

        const result = await this.collection.insertOne(sanitized)

        if (!result.acknowledged) {
            throw new AppError('save-failed', 500, result)
        }

        return sanitized
    }

    async findOne(action: ActionContext, filter: FilterCriteria) {
        return await this.collection.findOne(mongoAggregators.filter(filter, this.config)) as T
    }

    async update(action: ActionContext, filter: FilterCriteria, data: T) {
        const query = mongoAggregators.filter(filter, this.config)
        const existingItem = await this.collection.findOne(query) as T
        if (!existingItem) {
            console.warn("Update did not find item for", query, ", creating new item");
        }
        const item = existingItem || {}

        const stats = item.stats
        merge(item, data)
        this.integrityService.sanitize(this.config.schema, item)
        item.stats = stats || {}

        if (!existingItem) {
            item.stats.creator = action.actor
            item.stats.createdAt = action.moment
        }

        item.stats.editor = action.actor
        item.stats.editedAt = action.moment

        const result = existingItem
            ? await this.collection.replaceOne(query, item)
            : await this.collection.insertOne(item)
        if (!result.acknowledged) {
            throw new Error('update-error.unacknowledged')
        }

        const updatedItem = await this.collection.findOne(query) as T

        return updatedItem
    }

    async delete(action: ActionContext, filter: FilterCriteria) {
        const query = mongoAggregators.filter(filter, this.config)
        const item = await this.collection.findOne(query)
        if (!item) {
            return {result: 'not-found'}
        }

        if (!item.stats) {
            item.stats = {}
        }
        item.stats.deletor = action.actor
        item.stats.deletedAt = action.moment

        const result = await this.collection.updateOne(query, item)
        if (!result.acknowledged) {
            throw new Error('update-error.unacknowledged')
        }

        return true
    }

    private async checkUnique(checkItem: T): Promise<UniqueConstraintError[] | null> {
        const unique = this.config.schema.unique

        if (!unique) {
            return null
        }

        const checks: (UniqueConstraintError|null)[] = await Promise.all(unique.map(async (constraint) => {
            const filter = mongoAggregators.filter({[constraint]: get(checkItem, constraint)}, this.config)


            const existingItem = await this.collection.findOne(filter)
            if (existingItem) {
                return {constraint}
            }

            return null
        }))

        return checks.filter((check) => !!(check)) as UniqueConstraintError[]
    }

    private get collection() {
        return this.mongoClient.db().collection(this.config.meta.entityFqn)
    }
}

type UniqueConstraintError = {
    constraint: UniqueConstraint,
}
