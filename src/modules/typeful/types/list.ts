import { TypefulType } from "../typeful"

const t: TypefulType = {
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
export default t
