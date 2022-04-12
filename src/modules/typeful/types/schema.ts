import { defineTypefulType } from "../typeful"
import { SchemaField } from "../typeSystem"

export type SchemaSpec = SchemaField & {
    type: 'schema',
    fields: Record<string, SchemaField>,
}
type SchemaValue = Record<string, unknown>

export const isSchemaSpec = (subj: SchemaField): subj is SchemaSpec => {
    return subj.type === 'schema' && 'fields' in subj
}

export default defineTypefulType<SchemaSpec>({
    validate(value, options, scope, ctx) {
        if (!value || typeof value !== "object" || Array.isArray(value)) {
            scope?.pushError('invalid-type')
            return false
        }

        const obj = value as object

        let allOk = true
        let shallowValidation = false

        for (const name in options.fields) {
            const fieldScope = scope?.withPath(name)
            const field = options.fields[name]


            if (!(name in obj)) {
                if (!field.required) {
                    continue
                }
                allOk = false
                fieldScope?.pushError('required')
                continue
            }

            if (ctx && ctx.integrity) {
                const fieldValue = obj[name as keyof typeof obj]
                allOk = allOk && ctx.integrity.validate(field, fieldValue, fieldScope) === true
            } else {
                shallowValidation = true
            }
        }
        if (shallowValidation) {
            console.warn("No integrity given on schema.validate(..., ..., ctx) - shallow validation applied");
        }

        return allOk
    },
    sanitize(value, options, sanitizeOptions, ctx) {
        if (!value || typeof value !== "object") {
            return
        }

        const obj = value as SchemaValue

        Object.keys(obj).forEach((name) => {
            if (!options.fields[name]) {
                const allowlist = sanitizeOptions?.allowlist
                if (!allowlist || !Array.isArray(allowlist) || !allowlist.includes(name)) {
                    delete obj[name as keyof typeof obj]
                }
            }
        })

        Object.entries(options.fields).forEach(([name, field]) => {
            const key = name as keyof typeof obj
            if (!(key in obj) && 'defaultValue' in field) {
                obj[key] = field.defaultValue as never
            }

            if (ctx && 'fields' in field) {
                const sanitized = obj[key] === undefined ? undefined : ctx.integrity.sanitize(field, obj[key], options)
                if (sanitized !== undefined) {
                    obj[key] = sanitized
                }
            }
        })

        return obj
    },
})
