import { defineTypefulType } from "../typeful"

export default defineTypefulType({
    validate(value) {
        return Array.isArray(value)
    },
    sanitize(value) {
        if (!Array.isArray(value)) {
            return null
        }
        return value
    },
})
