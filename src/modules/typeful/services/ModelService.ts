import { EntityInstance } from "../typeful";
import { Dao } from "./dao/Daos";

import TypefulAccessor from "./TypefulAccessor";

export const create = <TEnt extends EntityInstance>(tfa: TypefulAccessor, model: string): ModelService<TEnt> => {
    return {
        dao: tfa.getDao<TEnt>(model),
    }
}

export default {
    create,
}

export type ModelService<TEnt extends EntityInstance> = {
    dao: Dao<TEnt>,
}
