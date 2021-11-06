import path from "path"
import glob from "glob"

import { ActionContext } from "../../../../app/middleware/actionContext"
import { EntityInstance } from "../../typeful"
import { Dao, FilterCriteria } from "./Daos"
import { EntityConfigEntry } from "../EntityRegistry"

type StaticStrategy<T> = {
    type: 'static',
    primaryKey: string,
    formatItem?: (item: T) => any,
}

export default class StaticDao<T extends EntityInstance = any> implements Dao<T> {
    private readonly strategy: StaticStrategy<T>

    constructor(private readonly config: EntityConfigEntry, private dataDirMask: string) {
        this.strategy = config.strategy || {type: 'static'}
    }
    
    async list(actionContext: ActionContext) {
        let items = await this.loadItems(actionContext)
        if (this.strategy.formatItem) {
            items = await Promise.all(items.map(this.strategy.formatItem))
        }
        
        return {
            page: 1,
            total: items.length,
            items: items,
        }
    }

    async findOne(actionContext: ActionContext, criteria: FilterCriteria) {
        const key = this.strategy.primaryKey
        let items = await this.loadItems(actionContext)

        let item = items.find((item: any) => item[key] === criteria) as T
        if (item && this.strategy.formatItem) {
            item = await this.strategy.formatItem(item)
        }
        
        return item
    }

    private async loadItems(actionContext: ActionContext): Promise<T[]> {
        const mask = this.dataDirMask.replace('$tenantName', actionContext.tenant)

        const dataFilePattern = path.resolve(mask, this.config.meta.module, this.config.meta.name) + '.@(js|ts|json)'
        
        const file = glob.sync(dataFilePattern, {
            absolute: true
        })[0]

        if (!file) {
            throw new Error(`No file for '${this.config.meta.entityFqn}'`)
        }

        const ext = path.extname(file)
        let data = await import(file)
        if (ext !== 'json') {
            data = data.default
        }
        
        return data.collection
    }
}
