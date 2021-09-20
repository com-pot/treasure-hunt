export default {
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
        let number = Number(value)
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
