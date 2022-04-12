import { defineTypefulType } from "../typeful"
import { SchemaField } from "../typeSystem"

export type ListFieldSpec = SchemaField & {
    innerType: SchemaField,
}

export default defineTypefulType<ListFieldSpec>({
    validate(value, options, scope, ctx) {
        if (!Array.isArray(value)) {
            scope?.pushError('invalid-type')
            return false
        }

        let allValid = true
        const innerType = options.innerType
        if (ctx?.integrity && innerType) {
            for (let i = 0; i < value.length; i++) {
                const itemScope = scope?.withPath(`[${i}]`)
                allValid = allValid && ctx.integrity.validate(innerType, value[i], itemScope)
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
