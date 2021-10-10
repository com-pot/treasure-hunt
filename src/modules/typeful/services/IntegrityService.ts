import { EntityModel } from "../typeful";
import TypeRegistry from "./TypeRegistry";

type ValidationScope = any
type SanitizeOptions = any

export default class IntegrityService {
    private readonly _integrityContext: any

    constructor(private typeRegistry: TypeRegistry) {
        this._integrityContext = {
            integrity: this,
            typeRegistry,
        }
    }
    
    validate<T>(spec: EntityModel, subject: T, scope? : ValidationScope) {
        const type = this.typeRegistry.get(spec.type)
        if (!type) {
            console.error("Unknown type on", spec);
            return {type: 'typeful.unknown-type', specType: spec.type}
        }
        
        if (!type.validate) {
            console.error(`Type '${spec.type}' does not support validate`);
            return
        }
        
        return type.validate(subject, spec, this._integrityContext, scope)
    }
    
    sanitize<T>(spec: EntityModel, subject: T, options: SanitizeOptions = {}): T {
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
