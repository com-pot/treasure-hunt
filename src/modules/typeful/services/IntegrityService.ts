import AppError from "../../../app/AppError";
import { SchemaField } from "../typeSystem";
import TypeRegistry from "./TypeRegistry";

export type IntegrityContext = {
    integrity: IntegrityService,
    typeRegistry: TypeRegistry,
}
export type ValidationScope = object
export type SanitizeOptions = Record<string, unknown>

export default class IntegrityService {
    private readonly _integrityContext: IntegrityContext

    constructor(private typeRegistry: TypeRegistry) {
        this._integrityContext = {
            integrity: this,
            typeRegistry,
        }
    }

    validate<T>(spec: SchemaField, subject: T, scope?: ValidationScope): boolean {
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

    sanitize<T>(spec: SchemaField, subject: T, options: SanitizeOptions = {}): T {
        const type = this.typeRegistry.get(spec.type)

        if (!type) {
            throw new AppError('misconfigured-spec.unknown-type', 501, {spec})
        }

        if (!type.sanitize) {
            throw new AppError('not-implemented-sanitize', 501, {type: spec.type})
        }

        return type.sanitize(subject, spec, this._integrityContext, options)
    }
}
