import { EntityInstance } from "../typeful";
import { Dao } from "./dao/Daos";
import { EntityConfigEntry } from "./EntityRegistry";

import TypefulAccessor from "./TypefulAccessor";

export const create = <TEnt extends EntityInstance>(tfa: TypefulAccessor, spec: EntityConfigEntry): ModelService<TEnt> => {
    return {
        dao: tfa.getDao<TEnt>(spec.meta.entityFqn),
    }
}

export default {
    create,
}

export type ModelService<TEnt extends EntityInstance> = {
    dao: Dao<TEnt>,
}
