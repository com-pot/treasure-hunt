import { TypefulType } from "../typeful"

const t: TypefulType = {
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
        if (typeof value !== 'number' || Number.isNaN(number)) {
            return null
        }
        if (options.mode === 'int') {
            return Math.floor(number)
        }

        return number
    },
}
export default t
