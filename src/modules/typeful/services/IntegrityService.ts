import AppError from "../../../app/AppError";
import { SchemaField } from "../typeSystem";
import TypeRegistry from "./TypeRegistry";

export type IntegrityContext = {
    integrity: IntegrityService,
    typeRegistry: TypeRegistry,
}
export type ValidationError = {path: string, error: string, args?: any[]}
export type ValidationScope = {
    _path: string, errors: ValidationError[],
    withPath: (path: string) => ValidationScope,
    pushError: (error: string, args?: ValidationError['args']) => void,
}
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
            console.error("Unknown type on", spec, "available types", this.typeRegistry.listAvailableTypes());
            throw new AppError('typeful.unknown-type', 501, {specType: spec.type})
        }

        if (spec.enum && !spec.enum.includes(subject)) {
            scope?.pushError('non-enum-value')
            return false
        }

        if (!type.validate) {
            console.error(`Type '${spec.type}' does not support validate`);
            return true
        }

        return type.validate(subject, spec, scope, this._integrityContext)
    }

    sanitize<T>(spec: SchemaField, subject: T, options: SanitizeOptions = {}): T {
        const type = this.typeRegistry.get(spec.type)

        if (!type) {
            throw new AppError('misconfigured-spec.unknown-type', 501, {spec})
        }

        if (!type.sanitize) {
            throw new AppError('not-implemented-sanitize', 501, {type: spec.type})
        }

        return type.sanitize(subject, spec, options, this._integrityContext)
    }
}

export const createValidationScope = (): ValidationScope => ({
    _path: '',
    errors: [],

    withPath(path) {
        const childScope: Partial<ValidationScope> = {
            _path: `${this._path ? this._path + '.' : ''}${path}`,
            errors: this.errors,
        }

        childScope.withPath = this.withPath.bind(childScope)
        childScope.pushError = this.pushError.bind(childScope)

        return childScope as ValidationScope
    },
    pushError(error, args) {
        this.errors.push({path: this._path, error, args})
    },
})
