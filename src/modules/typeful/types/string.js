module.exports.default = {
    validate(value, options, scope) {
        if (typeof value !== "string") {
            scope?.pushError('invalid-type')
            return false
        }
        if (options.minLength && value.length < options.minLength) {
            scope?.pushError('constraint-error', ['minLength', options.minLength])
            return false
        }
        if (options.maxLength && value.length > options.maxLength) {
            scope?.pushError('constraint-error', ['maxLength', options.maxLength])
            return false
        }

        return true
    },
    sanitize(value) {
        return '' + value
    },
}
