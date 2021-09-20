export default {
    validate(value) {
        return typeof value === "string"
    },
    sanitize(value) {
        return '' + value
    },
}
