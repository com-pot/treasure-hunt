import { defineTypefulType } from "../typeful"
import { SchemaField } from "../typeSystem"

export type SchemaSpec = SchemaField & {
    type: 'object',
    properties: Record<string, SchemaField>,
}
type SchemaValue = Record<string, unknown>

export const isSchemaSpec = (subj: SchemaField): subj is SchemaSpec => {
    return 'properties' in subj && !!subj.properties && typeof subj.properties === "object"
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

        const required = options.required as string[] || []

        for (const name in options.properties) {
            const fieldScope = scope?.withPath(name)
            const field = options.properties[name]


            if (!(name in obj)) {
                if (!required.includes(name)) {
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
            if (!options.properties[name]) {
                const allowlist = sanitizeOptions?.allowlist
                if (!allowlist || !Array.isArray(allowlist) || !allowlist.includes(name)) {
                    delete obj[name as keyof typeof obj]
                }
            }
        })

        Object.entries(options.properties).forEach(([name, field]) => {
            const key = name as keyof typeof obj
            if (!(key in obj) && 'defaultValue' in field) {
                obj[key] = field.defaultValue as never
            }

            if (ctx && 'properties' in field) {
                const sanitized = obj[key] === undefined ? undefined : ctx.integrity.sanitize(field, obj[key], options)
                if (sanitized !== undefined) {
                    obj[key] = sanitized
                }
            }
        })

        return obj
    },
})
