import { FieldModel, TypefulType } from "../typeful"

export type SchemaSpec = FieldModel & {
    fields: Record<string, FieldModel>,
}

const typeObj: TypefulType<SchemaSpec> = {
    validate(value, options, ctx, scope) {
        if (!scope) {
            scope = {}
        }
        if (!value || typeof value !== "object" || Array.isArray(value)) {
            return false
        }

        const obj = value as object

        const errors = []
        for (const name in options.fields) {
            const field = options.fields[name]

            if (!(name in obj)) {
                if (!field.required) {
                    continue
                }
                errors.push(name)
                continue
            }

            let validateField: (value: unknown, spec: FieldModel) => boolean = () => true
            if (ctx && ctx.integrity) {
                validateField = (fieldValue, field) => {
                    return ctx.integrity.validate(field, fieldValue) === true
                }
            }

            if (!validateField(obj[name as keyof typeof obj], field)) {
                errors.push(name)
            }
        }

        return !errors.length
    },
    sanitize(value, options, ctx, sanitizeOptions: Record<string, unknown>) {
        if (!value || typeof value !== "object") {
            return
        }

        const obj = value as object

        Object.keys(obj).forEach((name) => {
            if (!options.fields[name]) {
                const allowlist = sanitizeOptions?.allowlist
                if (!allowlist || !Array.isArray(allowlist) || !allowlist.includes(name)) {
                    delete obj[name as keyof typeof value]
                }
            }
        })

        Object.entries(options.fields).forEach(([name, field]) => {
            const key = name as keyof typeof obj
            if (!(key in obj) && 'defaultValue' in field) {
                obj[key] = field.defaultValue as never
            }

            if (ctx) {
                const sanitized = obj[key] === undefined ? undefined : ctx.integrity.sanitize(field, obj[key], options)
                if (sanitized !== undefined) {
                    obj[key] = sanitized
                }
            }
        })

        return obj
    },
}

export default typeObj
