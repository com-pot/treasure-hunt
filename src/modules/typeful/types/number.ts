import { defineTypefulType } from "../typeful"

type NumberSpec = {
    mode?: 'int'
}

export default defineTypefulType<NumberSpec>({
    validate(value, options) {
        if (typeof value !== 'number' || Number.isNaN(value)) {
            return false
        }
        if (options.mode === 'int') {
            return Number.isSafeInteger(value)
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
