import merge from "lodash/merge.js"

import mongodb from "mongodb"
import IntegrityService from "../services/IntegrityService.js"

const createQuery = (findBy, strategy) => {
    let query = findBy
        if (typeof findBy !== "object") {
            query = {[strategy.primaryKey]: findBy}
        }

        return query
}

export default class DaoController {
    constructor(name, config, strategy) {
        this.name = name
        this.model = config.model
        this.hooks = config.hooks || {}
        this.strategy = strategy
        /** @type {mongodb.MongoClient} */
        this.mongoClient = strategy.mongoClient

        /** @type {IntegrityService} */
        this.integrityService = null
    }

    async list(action, params) {
        const collection = this.mongoClient.db().collection(this.name)

        const items = await collection.find({}).toArray()
        const total = await collection.countDocuments({})

        return {
            page: 1,
            total,
            items,
        }
    }

    async create(action, data) {
        const errors = this.integrityService.validate(this.model, data)

        if (errors && errors.length) {
            throw Object.assign(new Error('invalid-data'), {details: {errors}})
        }

        const collection = this.mongoClient.db().collection(this.name)
        
        let sanitized = this.integrityService.sanitize(this.model, data)

        sanitized.stats = {
            creator: action.actor,
            createdAt: action.moment,
            editor: action.actor,
            editedAt: action.moment,
        }

        if (this.hooks.beforeSave) {
            await this.hooks.beforeSave(sanitized)
        }

        const result = await collection.insertOne(sanitized)

        if (!result.acknowledged) {
            throw Object.assign(new Error('save-failed'), {status: 500, details: result})
        }

        return sanitized
    }

    async findOne(action, findBy) {
        const collection = this.mongoClient.db().collection(this.name)

        const result = await collection.findOne(createQuery(findBy, this.strategy))
        if (!result) {
            throw new Error('not-found')
        }

        return result
    }

    async update(action, findBy, data) {
        const collection = this.mongoClient.db().collection(this.name)

        const query = createQuery(findBy, this.strategy)
        const item = await collection.findOne(query)
        if (!item) {
            throw new Error('not-found')
        }
        
        delete data.stats
        merge(item, data)
        this.integrityService.sanitize(this.model, item, {
            allowlist: ['stats', '_id']
        })
        if (!item.stats) {
            item.stats = {}
        }

        item.stats.editor = action.actor
        item.stats.editedAt = action.moment

        const result = await collection.updateOne(query, {$set: item})
        if (!result.acknowledged) {
            throw new Error('update-error.unacknowledged')
        }

        return item
    }

    async delete(action, findBy) {
        const collection = this.mongoClient.db().collection(this.name)

        const query = createQuery(findBy, this.strategy)
        const item = await collection.findOne(query)
        if (!item) {
            return {status: 'not-found'}
        }

        if (!item.stats) {
            item.stats = {}
        }
        item.stats.deletor = action.actor
        item.stats.deletedAt = action.moment

        const result = await collection.updateOne(query, {$set, item})
        if (!result.acknowledged) {
            throw new Error('update-error.unacknowledged')
        }

        return true
    }
}
