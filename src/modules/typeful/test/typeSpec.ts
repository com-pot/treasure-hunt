import { describe, it, expect } from "vitest"

// When using modules from .ts files, import syntax cannot be used
import defaultTypesModule from "../defaultTypesModule"
import IntegrityService from "../services/IntegrityService"
import TypeRegistry from "../services/TypeRegistry"
import { TypefulType } from "../typeful"
import { SchemaField } from "../typeSystem"

export const stringify = (value: unknown): string => {
    if (Array.isArray(value)) {
        return '[' + value.map(stringify).join(', ') + ']'
    }
    if (value && typeof value === "object") {
        return JSON.stringify(value)
    }
    if (value === null) {
        return 'null'
    }
    if (value === undefined) {
        return 'undefined'
    }

    return '' + value
}

export default {
    stringify,
    validateType<TSpec extends SchemaField>(typeObj: TypefulType<TSpec>, typeConfig: TSpec,
         validValues: unknown[], invalidValues: unknown[], integrityService?: IntegrityService): void {
        describe(`validate`, function() {
            const evalValidity = (value: unknown) => integrityService
                ? integrityService.validate(typeConfig, value)
                : typeObj.validate(value, typeConfig)

            validValues.forEach((value) => {
                it(`passes '${stringify(value)}'`, function() {
                    expect(evalValidity(value)).to.equal(true)
                })
            })
            invalidValues.forEach((value) => {
                it(`fails '${stringify(value)}'`, function() {
                    expect(evalValidity(value)).to.equal(false)
                })
            })
        })

    },

    sanitizeValues<TSpec extends SchemaField>(typeObj: TypefulType<TSpec>, typeConfig: TSpec, sanitizeCases: [unknown, unknown][], integrityService?: IntegrityService) {
        sanitizeCases.forEach(([unsafeValue, expectedValue]) => {
            it(`sanitizes '${stringify(unsafeValue)}' to '${stringify(expectedValue)}'`, function() {
                const actualValue = integrityService
                    ? integrityService.sanitize(typeConfig, unsafeValue)
                    : typeObj.sanitize?.(unsafeValue, typeConfig)
                expect(actualValue).to.deep.equal(expectedValue)
            })
        })
    },

    createIntegrityService() {
        const typeRegistry = new TypeRegistry()
            .registerTypes(defaultTypesModule)
        const service = new IntegrityService(typeRegistry)

        return service
    },
}
