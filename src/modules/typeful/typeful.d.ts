export type EntityModel = any // TODO: redefine as ModelSchema
export type EntityConfig = {
    model: EntityModel,
    
    plural?: string,
    strategy?: {type: 'mongo'|'static', } | any,
    service?: any,
    
    publish?: boolean,
}

export type EntityInstance = {
    stats?: Partial<{
        creator: string|null,
        createdAt: Date|null,
        editor: string|null,
        editedAt: Date|null,
        deletor: string|null,
        deletedAt: Date|null,
    }>,
}

export type TypefulType = any // TODO: define TypefulType


export type TypefulModule = {
    types?: Record<string, TypefulType>
    typesPrefix?: string,
    
    entities?: Record<string, EntityConfig>
}
