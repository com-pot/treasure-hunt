import path from "path"
import glob from "glob"
import { get } from "lodash"

import { ActionContext } from "../../../../app/middleware/actionContext"
import { EntityInstance } from "../../typeful"
import { Dao, FilterCriteria } from "./Daos"
import { EntityConfigEntry } from "../EntityRegistry"
import AppError from "../../../../app/AppError"


export default class StaticDao<T extends EntityInstance> implements Dao<T> {

    private itemList: T[]|null = null

    constructor(private readonly config: EntityConfigEntry, private dataDirMask: string) {

    }

    public overrideItems(items: T[]) {
        if (!Array.isArray(items)) {
            throw new Error('Invalid overrideItems argument')
        }

        this.itemList = items
    }

    async list(actionContext: ActionContext) {
        let items = await this.loadItems(actionContext)

        return {
            page: 1,
            perPage: 0,
            total: items.length,
            items: items,
        }
    }

    async findOne(actionContext: ActionContext, criteria: FilterCriteria) {
        const key = this.config.primaryKey as keyof T
        const items = await this.loadItems(actionContext)
        if (typeof criteria !== 'object') {
            criteria = {[key]: criteria}
        }

        let item = items.find((check) => {
            return Object.entries(criteria).every(([name, value]) => get(check, name) === value)
        }) as T

        return item
    }

    public async count(action: ActionContext): Promise<number> {
        const items = await this.loadItems(action)
        return items.length
    }

    create(): Promise<T> {
        return rejectStaticModification()
    }
    update(): Promise<T> {
        return rejectStaticModification()
    }
    delete(): Promise<boolean | { result: string; }> {
        return rejectStaticModification()
    }
    aggregate<TAggr = unknown>(): Promise<TAggr[]> {
        return rejectStaticModification()
    }

    private async loadItems(actionContext: ActionContext): Promise<T[]> {
        if (this.itemList) {
            return Promise.resolve(this.itemList)
        }

        const mask = this.dataDirMask.replace('$tenantName', actionContext.tenant)

        const dataFilePattern = path.resolve(mask, this.config.meta.module, this.config.meta.name) + '.@(js|ts|json)'

        const file = glob.sync(dataFilePattern, {
            absolute: true
        })[0]

        if (!file) {
            return Promise.reject(new Error(`No file for '${this.config.meta.entityFqn}'`))
        }

        const ext = path.extname(file)
        let data = await import(file)
        if (ext !== 'json') {
            data = data.default
        }

        return data.collection
    }
}

const rejectStaticModification = () => Promise.reject(new AppError('not-allowed', 403, {reason: 'static-collection-modification-prevented'}))
