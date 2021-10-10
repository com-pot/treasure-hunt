import { Dao, DaoStrategy } from "./dao/Daos"
import { EntityConfigEntry } from "./EntityRegistry";

export type DaoCreateFn = (config: EntityConfigEntry) => Dao

export default class DaoFactory {
    private daoCreateFns: Record<string, DaoCreateFn> = {}

    registerCreateFn(type: string, fn: DaoCreateFn): this {
        if (this.daoCreateFns[type]) {
            console.warn(`Dao type '${type}' already implemented`);
            return this
        }
        this.daoCreateFns[type] = fn

        return this
    }

    strategyFulfillable(strategy: DaoStrategy): boolean {
        return strategy.type in this.daoCreateFns
    }

    createDao(config: EntityConfigEntry): Dao {
        const createFn = this.daoCreateFns[config.strategy.type]
        if (!createFn) {
            throw new Error(`Dao type '${config.strategy.type}' not available`)
        }

        return this.daoCreateFns[config.strategy.type](config)
    }
}
