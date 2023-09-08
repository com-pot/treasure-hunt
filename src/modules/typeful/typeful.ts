import { ObjectId } from "mongodb"
import { IntegrityContext, SanitizeOptions, ValidationScope } from "./services/IntegrityService"
import { EntityConfigEntry } from "./services/EntityRegistry"
import TypefulAccessor from "./services/TypefulAccessor"
import { SchemaSpec } from "./types/object"
import { SortOrder } from "./services/dao/Daos"


export type EntityPluginFactory<T> = (tfa: TypefulAccessor, entity: EntityConfigEntry) => T
export type EntityPluginModule = object | { create: EntityPluginFactory<unknown> } // eslint-disable-line @typescript-eslint/no-explicit-any
export type UniqueConstraint = string
export type StringifySpec = string | {template: string}

export type EntitySpec = {
    plural?: string,
    persistence?: 'mongo' | 'static' | string,
    primaryKey?: string,
    stringify?: StringifySpec,

    publish?: boolean,
}

export type EntityConfig = EntitySpec & {
    schema: SchemaSpec & {
        unique?: UniqueConstraint[],
    },
    _plugins: Record<string, EntityPluginModule>,
    primaryKey: Required<EntitySpec['primaryKey']>,

    defaultSort?: SortOrder,
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

export type EntityRef<TEnt extends EntityInstance = EntityInstance> = TEnt['_id']|string

export type TypefulType<TSpec extends object = Record<string, unknown>> = {
    validate(value: unknown, spec: TSpec, scope?: ValidationScope, ctx?: IntegrityContext): boolean,
    sanitize?(value: unknown, spec: TSpec, options?: SanitizeOptions, ctx?: IntegrityContext): null|undefined|any,
}
export const defineTypefulType = <TSpec extends object = Record<string, unknown>>(type: TypefulType<TSpec>) => type
export type TypesModule = {
    types: Record<string, TypefulType>,
}


export type TypefulModule = {
    types?: Record<string, TypefulType>
    typesPrefix?: string,

    entities?: Record<string, EntityConfig>
}

export const defineEntity = <T extends EntitySpec>(spec: T): T => spec

export function defineModelPluginFactory<T>(factory: (tfa: TypefulAccessor, spec: EntityConfigEntry) => T) {
    return factory
}
