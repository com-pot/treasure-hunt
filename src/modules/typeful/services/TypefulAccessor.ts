import { ServiceContainer } from "../../../app/types/app";
import AppError from "../../../app/AppError";
import EntityRegistry, { EntityConfigEntry } from "./EntityRegistry";
import { Dao } from "./dao/Daos";
import DaoFactory from "./DaoFactory";
import { EntityInstance } from "../typeful";


/**
* Yes, passing dependencies through container is not the best idea as it
* expects the dependencies to be in certain state...
*/
export default class TypefulAccessor {
    private daoCache: Record<string, Dao> = {}

    constructor(private readonly serviceContainer: ServiceContainer) {

    }

    getDao<TEnt extends EntityInstance = EntityInstance>(model: string): Dao<TEnt> {
        if (!this.daoCache[model]) {
            const entity = this.getEntityEntry(model)
            const daoFactory = this.serviceContainer.daoFactory as DaoFactory
            this.daoCache[model] = daoFactory.createDao(entity)
        }

        return this.daoCache[model] as Dao<TEnt>
    }

    getModel<TModel>(model: string): TModel {
        const entity = this.getEntityEntry(model)
        if (!entity._plugins.service) {
            throw new AppError('misconfigured-model', 500, {error: 'no-service', entity: model})
        }

        return entity._plugins.service as unknown as TModel
    }

    getEntityEntry(model: string): EntityConfigEntry {
        const entityRegistry = this.serviceContainer.entityRegistry as EntityRegistry
        const entity = entityRegistry.get(model)
        if (!entity) {
            throw new AppError('not-found', 404, {error: 'entity-not-found', entity: model})
        }

        return entity
    }
}
