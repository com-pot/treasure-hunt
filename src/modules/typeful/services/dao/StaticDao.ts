import path from "path"
import glob from "glob"

import { ActionContext } from "../../../../app/middleware/actionContext"
import { EntityInstance } from "../../typeful"
import { Dao, FilterCriteria } from "./Daos"
import { EntityConfigEntry } from "../EntityRegistry"
import AppError from "../../../../app/AppError"

type StaticStrategy<T> = {
    type: 'static',
    primaryKey: string,
    formatItem?: (item: Partial<T>) => T,
}

export default class StaticDao<T extends EntityInstance> implements Dao<T> {
    private readonly strategy: StaticStrategy<T>

    constructor(private readonly config: EntityConfigEntry, private dataDirMask: string) {
        this.strategy = (config.strategy || {type: 'static'}) as StaticStrategy<T>
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
        const key = this.strategy.primaryKey as keyof T
        const items = await this.loadItems(actionContext)
        if (typeof criteria !== 'object') {
            criteria = {[key]: criteria}
        }

        let item = items.find((check) => {
            return Object.entries(criteria).every(([name, value]) => check[name as keyof T] === value)
        }) as T
        if (item && this.strategy.formatItem) {
            item = await this.strategy.formatItem(item)
        }

        return item
    }

    public async count(action: ActionContext): Promise<number> {
        const items = await this.loadItems(action)
        return items.length
    }

    create(): Promise<T> {
        return Promise.reject(new AppError('not-implemented', 501))
    }
    update(): Promise<T> {
        return Promise.reject(new AppError('not-implemented', 501))
    }
    delete(): Promise<boolean | { result: string; }> {
        return Promise.reject(new AppError('not-implemented', 501))
    }
    aggregate<TAggr = unknown>(): Promise<TAggr[]> {
        return Promise.reject(new AppError('not-implemented', 501))
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
