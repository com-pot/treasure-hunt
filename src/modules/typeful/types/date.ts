import { defineTypefulType } from "../typeful"

export default defineTypefulType({
    validate() {
        console.warn("Validate for type date is not implemented");
        return true
    },
    sanitize(value) {
        if (value instanceof Date) {
            return value
        }

        let date
        if (typeof value === 'string' || typeof value === 'number') {
            date = new Date(value)
        } else {
            throw new Error("Invalid value")
        }

        if (Number.isSafeInteger(date.getDate())) {
            return date
        }
    },
})
