import { ObjectId } from "mongodb"
import { IntegrityContext } from "./services/IntegrityService"

// TODO: redefine as ModelSchema
export type FieldModel = {
    type: string,
    required?: boolean,
    defaultValue?: unknown,
}
export type EntityModelSchema = FieldModel & SchemaSpec

type EntityPluginModule = object | {create: (...any) => any } // eslint-disable-line @typescript-eslint/no-explicit-any

export type PersistenceStrategy = {
    type: 'mongo' | 'static' | string,
    primaryKey: string,
}
export type EntityConfig = {
    model: EntityModelSchema,

    plural?: string,
    strategy?: PersistenceStrategy,

    publish?: boolean,

    _plugins: Record<string, EntityPluginModule>,
}

export type EntityInstance = {
    _id: ObjectId

    stats?: Partial<{
        creator: string|null,
        createdAt: Date|null,
        editor: string|null,
        editedAt: Date|null,
        deletor: string|null,
        deletedAt: Date|null,
    }>,
}

export type EntityRef<TEnt extends EntityInstance = EntityInstance> = ObjectId|string

export type TypefulType<TSpec extends object = Record<string, unknown>> = {
    validate(value: unknown, spec: TSpec, context?: IntegrityContext, scope?: ValidationScope): boolean,
    sanitize?(value: unknown, spec: TSpec, ctx?: IntegrityContext, options?: unknown),
}
export type TypesModule = {
    types: Record<string, TypefulType>,
}


export type TypefulModule = {
    types?: Record<string, TypefulType>
    typesPrefix?: string,

    entities?: Record<string, EntityConfig>
}
