import AppError from "../../../app/AppError";
import { Dao, DaoStrategy } from "./dao/Daos"
import { EntityConfigEntry } from "./EntityRegistry";

export type DaoCreateFn = (config: EntityConfigEntry) => Partial<Dao>

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

        const daoProxy = new Proxy(this.daoCreateFns[config.strategy.type](config), {
            get(t, p) {
                const prop = p as keyof Dao
                if (!t[prop]) {
                    return () => Promise.reject(new AppError('not-implemented', 501, {
                        subject: 'dao',
                        key: config.meta.entityFqn,
                        member: prop,
                    }))
                }

                return t[prop]
            }
        })

        return daoProxy as Dao
    }
}
