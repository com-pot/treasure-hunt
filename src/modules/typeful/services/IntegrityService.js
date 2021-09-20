export default class IntegrityService {
    constructor(typeRegistry) {
        this.typeRegistry = typeRegistry
        this._integrityContext = {
            integrity: this,
            typeRegistry,
        }
    }
    
    validate(spec, subject, scope) {
        const type = this.typeRegistry.get(spec.type)
        if (!type) {
            console.error("Unknown type on", spec);
            return {type: 'typeful.unknown-type', type: spec.type}
        }
        
        if (!type.validate) {
            console.error(`Type ${spec.type} does not support validate`);
            return
        }
        
        return type.validate(subject, spec, this._integrityContext, scope)
    }
    
    sanitize(spec, subject, options) {
        const type = this.typeRegistry.get(spec.type)
        if (!type) {
            throw Object.assign(new Error('misconfigured-spec.unknown-type'), {status: 501, details: {spec}})
        }
        
        if (!type.sanitize) {
            throw Object.assign(new Error('not-implemented-sanitize'), {status: 501, details: {type: spec.type}})
        }
        
        return type.sanitize(subject, spec, this._integrityContext, options)
    }
}
