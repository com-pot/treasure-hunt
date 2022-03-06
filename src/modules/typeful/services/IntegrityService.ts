import AppError from "../../../app/AppError";
import { EntityModelSchema, FieldModel } from "../typeful";
import TypeRegistry from "./TypeRegistry";

export type IntegrityContext = {
    integrity: IntegrityService,
    typeRegistry: TypeRegistry,
}
export type ValidationScope = object
type SanitizeOptions = object

export default class IntegrityService {
    private readonly _integrityContext: IntegrityContext

    constructor(private typeRegistry: TypeRegistry) {
        this._integrityContext = {
            integrity: this,
            typeRegistry,
        }
    }

    validate<T>(spec: FieldModel, subject: T, scope?: ValidationScope): boolean {
        const type = this.typeRegistry.get(spec.type)
        if (!type) {
            console.error("Unknown type on", spec);
            throw new AppError('typeful.unknown-type', 501, {specType: spec.type})
        }

        if (!type.validate) {
            console.error(`Type '${spec.type}' does not support validate`);
            return true
        }

        return type.validate(subject, spec, this._integrityContext, scope)
    }

    sanitize<T>(spec: EntityModelSchema, subject: T, options: SanitizeOptions = {}): T {
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
