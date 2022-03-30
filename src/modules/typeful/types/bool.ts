import { defineTypefulType } from "../typeful"

export default defineTypefulType({
    validate(value) {
        return typeof value === "boolean"
    },
    sanitize(value) {
        if (value === undefined || value === null) {
            return value
        }
        if (typeof value === 'number') {
            return !!value
        }
        if (value === 'true' || value === true) {
            return true
        }
        if (value === 'false' || value === false) {
            return false
        }

        return null
    },
})
