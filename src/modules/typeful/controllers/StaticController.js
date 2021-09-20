export default class StaticController {
    constructor(name, config, strategy) {
        this.name = name
        this.model = config.model
        this.strategy = strategy
    }
    
    async list(actionContext) {
        const items = this.strategy.items
        
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
        return item
    }
}
