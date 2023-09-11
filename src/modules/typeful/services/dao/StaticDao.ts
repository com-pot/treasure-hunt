import path from "path"
import glob from "glob"
import { get } from "lodash"

import { ActionContext } from "../../../../app/middleware/actionContext"
import { EntityInstance } from "../../typeful"
import { Dao, FilterCriteria, PaginatedList } from "./Daos"
import { EntityConfigEntry } from "../EntityRegistry"
import AppError from "../../../../app/AppError"

type PickItemFn<T> = (ctx: ActionContext, item: T) => boolean
export default class StaticDao<T extends EntityInstance> implements Dao<T> {

    private itemList: T[]|null = null
    private getItemFilter: (ctx: ActionContext) => PickItemFn<T> = (ctx) => () => true

    constructor(private readonly config: EntityConfigEntry, private dataDirMask: string) {

    }

    public overrideItems(items: T[]) {
        if (!Array.isArray(items)) {
            throw new Error('Invalid overrideItems argument')
        }

        this.itemList = items
    }
    public overrideFilter(itemFilterGetter: (ctx: ActionContext) => PickItemFn<T>) {
        this.getItemFilter = itemFilterGetter
    }

    async list(actionContext: ActionContext): Promise<PaginatedList<T>> {
        let items = await this.loadItems(actionContext)
        const pickItem = this.getItemFilter(actionContext)
        items = items.filter((item) => pickItem(actionContext, item))

        return {
            items: items,
            page: 1,
            perPage: 0,
            totalItems: items.length,
            totalPages: 1,
        }
    }

    async findOne(actionContext: ActionContext, criteria: FilterCriteria) {
        const key = this.config.primaryKey as keyof T
        const items = await this.loadItems(actionContext)
        if (typeof criteria !== 'object') {
            criteria = {[key]: criteria}
        }

        const itemMatchesAllCriteria = (item: T): boolean => Object.entries(criteria || {}).every(([name, value]) => get(item, name) === value)
        let item = items.find(itemMatchesAllCriteria)

        return item ?? null
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
            return Promise.reject(new Error(`No file for ${actionContext.tenant}#${this.config.meta.entityFqn} - ` + dataFilePattern))
        }

        const ext = path.extname(file)
        let data = await import(file)
        if (ext !== 'json') {
            data = data.default
        }

        return data.items
    }
}

const rejectStaticModification = () => Promise.reject(new AppError('not-allowed', 403, {reason: 'static-collection-modification-prevented'}))
