export default class StaticController {
    constructor(name, config, strategy) {
        this.name = name
        this.model = config.model
        this.strategy = strategy
    }
    
    async list(actionContext) {
        let items = this.strategy.items
        if (this.strategy.formatItem) {
            items = await Promise.all(items.map(this.strategy.formatItem))
        }

        
        return {
            page: 1,
            total: items.length,
            items: items,
        }
    }

    async findOne(actionContext, criteria) {
        const key = this.strategy.primaryKey

        const item = this.strategy.items.find((item) => item[key] === criteria)
        if (!item) {
            throw new Error('not-found')
        }
        if (this.strategy.formatItem) {
            item = await this.strategy.formatItem(item)
        }
        return item
    }
}
