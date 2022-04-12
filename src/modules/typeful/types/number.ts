import { defineTypefulType } from "../typeful"
import { SchemaField } from "../typeSystem"

type NumberSpec = SchemaField & {
    mode?: 'int' | string,
    minValue?: number,
    maxValue?: number,
}

export default defineTypefulType<NumberSpec>({
    validate(value, options, scope) {
        if (typeof value !== 'number' || Number.isNaN(value)) {
            scope?.pushError('invalid-type')
            return false
        }
        if (options.mode === 'int' && !Number.isSafeInteger(value)) {
            scope?.pushError('not-an-integer')
            return false
        }
        if (typeof options.minValue === "number" && value < options.minValue) {
            scope?.pushError('constraint-error', ['minValue', options.minValue])
            return false
        }
        if (typeof options.maxValue === "number" && value > options.maxValue) {
            scope?.pushError('constraint-error', ['maxValue', options.maxValue])
            return false
        }

        return true
    },
    sanitize(value, options) {
        const number = Number(value)
        if (value === undefined) {
            return undefined
        }
        if (typeof value === 'string') {
            value = Number(value)
        }
        if (typeof value !== 'number' || Number.isNaN(number)) {
            return null
        }
        if (options.mode === 'int') {
            return Math.floor(number)
        }

        return number
    },
})
