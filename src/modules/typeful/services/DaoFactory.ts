import appLogger from "../../../app/appLogger";
import { Dao } from "./dao/Daos"
import { EntityConfigEntry } from "./EntityRegistry";

const logger = appLogger.child({s: "DaoFactory"})

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

    strategyFulfillable(persistenceStrategy: string): boolean {
        return persistenceStrategy in this.daoCreateFns
    }

    createDao(config: EntityConfigEntry): Dao {
        const createFn = this.daoCreateFns[config.persistence]
        if (!createFn) {
            throw new Error(`Dao type '${config.persistence}' not available`)
        }

        const daoProxy = new Proxy(this.daoCreateFns[config.persistence](config), {
            get(t, p) {
                if (!(p in t)) {
                    logger.warn({
                        subject: 'dao',
                        key: config.meta.entityFqn,
                        member: p,
                    }, "illegal-dao-member-access")
                    return undefined
                }

                return t[p as keyof Dao]
            }
        })

        return daoProxy as Dao
    }
}
