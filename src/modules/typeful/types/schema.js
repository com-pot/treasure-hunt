export default {
    validate(value, options, ctx, scope) {
        if (!value || typeof value !== "object" || Array.isArray(value)) {
            return false
        }
        
        let errors = []
        Object.entries(options.fields).forEach(([name, field]) => {
            if (!(name in value)) {
                if (!field.required) {
                    return
                }
                errors.push(name)
                return
            }
            
            let validateField = () => true
            if (ctx && ctx.integrity) {
                validateField = (fieldValue, field) => {
                    return ctx.integrity.validate(field, fieldValue)
                }
            }
            if (!validateField(value[name], field)) {
                errors.push(name)
            }
        })
        
        return !errors.length
    },
    sanitize(value, options, ctx, sanitizeOptions) {
        if (!value || typeof value !== "object") {
            return
        }
        
        Object.keys(value).forEach((name) => {
            if (!options.fields[name]) {
                const allowlist = sanitizeOptions && sanitizeOptions.allowlist
                if (!allowlist || !allowlist.includes(name)) {
                    delete value[name]
                }
            }
        })
        
        Object.entries(options.fields).forEach(([name, field]) => {
            if (!(name in value) && 'defaultValue' in field) {
                value[name] = field.defaultValue
            }
            if (ctx) {
                const sanitized = value[name] === undefined ? undefined : ctx.integrity.sanitize(field, value[name])
                if (sanitized !== undefined) {
                    value[name] = sanitized
                }
            }
        })
        
        return value
    },
}
