export default {
    validate(value) {
        return Array.isArray(value)
    },
    sanitize(value) {
        if (!Array.isArray(value)) {
            return null
        }
        return value
    },
}
