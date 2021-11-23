import { EntityInstance } from "../typeful";

import TypefulAccessor from "./TypefulAccessor";

export const create = <TEnt extends EntityInstance>(tfa: TypefulAccessor, model: string) => {
    return {
        dao: tfa.getDao<TEnt>(model),
    }
}

export default {
    create,
}
