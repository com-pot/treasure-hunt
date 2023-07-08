import { defineTypefulType } from "../typeful"
import { SchemaField } from "../typeSystem"

export type ListFieldSpec = SchemaField & {
    items: SchemaField,
}

export default defineTypefulType<ListFieldSpec>({
    validate(value, options, scope, ctx) {
        if (!Array.isArray(value)) {
            scope?.pushError('invalid-type')
            return false
        }

        let allValid = true
        const itemsSchema = options.items
        if (ctx?.integrity && itemsSchema) {
            for (let i = 0; i < value.length; i++) {
                const itemScope = scope?.withPath(`[${i}]`)
                const valueValid = ctx.integrity.validate(itemsSchema, value[i], itemScope)

                allValid = allValid && valueValid
            }
        }

        return allValid
    },
    sanitize(value) {
        if (!Array.isArray(value)) {
            return null
        }
        return value
    },
})
