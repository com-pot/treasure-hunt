import TypefulAccessor from "./TypefulAccessor";

export const create = <TEnt>(tfa: TypefulAccessor, model: string) => {
    return {
        dao: tfa.getDao<TEnt>(model),
    }
}

export type ModelService<TEnt> = ReturnType<typeof create>

export default {
    create,
}
