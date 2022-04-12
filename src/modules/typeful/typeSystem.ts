import {toPath} from 'lodash';
import { isSchemaSpec, SchemaSpec } from "./types/schema";

export type SchemaField = {
    type: string,
    required?: boolean,
    defaultValue?: unknown,

    enum?: any[],

    [arg: string]: unknown,
}

export function getSchemaField(spec: SchemaSpec, path: string): SchemaField|undefined {
    let result: SchemaField = spec
    for (let part of toPath(path)) {
        if (!result || !isSchemaSpec(result)) {
            return undefined
        }
        result = result.fields[part]
    }

    return result
}
