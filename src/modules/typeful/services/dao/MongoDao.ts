import { merge } from "lodash"
import { MongoClient } from "mongodb"

import { ActionContext } from "../../../../app/middleware/actionContext"
import { EntityInstance } from "../../typeful"
import { EntityConfigEntry } from "../EntityRegistry"
import IntegrityService from "../IntegrityService"
import { AggregationTask, CreateRequest, Dao, FilterCriteria, ListResult, PaginationParam, SortOrder } from "./Daos"
import mongoAggregators from "./mongoAggregators"


export default class MongoDao<T extends EntityInstance> implements Dao<T> {
    
    private hooks: any = {}
    
    constructor(private readonly config: EntityConfigEntry, private mongoClient: MongoClient, private integrityService: IntegrityService) {
        
    }
    
    async list(action: ActionContext, filter?: FilterCriteria, sort?: SortOrder, pagination?: PaginationParam): Promise<ListResult<T>> {
        const query = mongoAggregators.filter(filter, this.config)
        const items = await this.collection.find(query).toArray() as T[]
        const total = await this.collection.countDocuments(query)
        
        return {
            page: 1,
            total,
            items,
        }
    }
    async count(action: ActionContext, filter?: FilterCriteria): Promise<number> {
        return this.collection.countDocuments(mongoAggregators.filter(filter, this.config))
    }
    async aggregate<TAggr=any>(action: ActionContext, aggregate: AggregationTask[]): Promise<TAggr[]> {
        const pipeline = mongoAggregators.prepareAggregationPipeline(this.config, aggregate)
        return this.collection.aggregate(pipeline).toArray() as Promise<TAggr[]>
    }
    
    async create(action: ActionContext, data: CreateRequest<T>) {
        const errors = this.integrityService.validate(this.config.model, data)
        
        if (errors && errors.length) {
            throw Object.assign(new Error('invalid-data'), {details: {errors}})
        }
        
        let sanitized = this.integrityService.sanitize(this.config.model, data)
        
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
            throw Object.assign(new Error('save-failed'), {status: 500, details: result})
        }
        
        return sanitized
    }
    
    async findOne(action: ActionContext, filter: FilterCriteria) {
        return await this.collection.findOne(mongoAggregators.filter(filter, this.config)) as T
    }
    
    async update(action: ActionContext, filter: FilterCriteria, data: T) {
        const query = mongoAggregators.filter(filter, this.config)
        const item = await this.collection.findOne(query) as T
        if (!item) {
            throw new Error('not-found')
        }
        
        delete data.stats
        merge(item, data)
        this.integrityService.sanitize(this.config.model, item, {
            allowlist: ['stats']
        })
        if (!item.stats) {
            item.stats = {}
        }
        
        item.stats.editor = action.actor
        item.stats.editedAt = action.moment
        
        const result = await this.collection.replaceOne(query, item)
        if (!result.acknowledged) {
            throw new Error('update-error.unacknowledged')
        }
        
        return item
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

    private get collection() {
        return this.mongoClient.db().collection(this.config.meta.entityFqn)
    }
}

