module.exports.default = {
    validate(value) {
        return typeof value === "string"
    },
    sanitize(value) {
        return '' + value
    },
}
