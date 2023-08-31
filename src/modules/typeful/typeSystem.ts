import {toPath} from 'lodash';
import { isSchemaSpec, SchemaSpec } from "./types/object";

export type SchemaField = {
    type: string,
    defaultValue?: unknown,

    enum?: any[],

    [arg: string]: unknown,
}

export type RefPath = string[]

export function getSchemaField(spec: SchemaSpec, path: RefPath | string): SchemaField|undefined {
    let result: SchemaField = spec
    for (let part of toPath(path)) {
        if (!result || !isSchemaSpec(result)) {
            return undefined
        }
        result = result.properties[part]
    }

    return result
}
