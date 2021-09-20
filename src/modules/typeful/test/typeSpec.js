import { expect } from "chai"

import IntegrityService from "../services/IntegrityService.js"
import TypeRegistry from "../services/TypeRegistry.js"
import defaultTypesModule from "../defaultTypesModule.js"

export const stringify = (value) => {
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
    validateType(typeObj, typeConfig, validValues, invalidValues, integrityService) {
        describe(`validate`, function() {
            const evalValidity = (value) => integrityService
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
    
    sanitizeValues(typeObj, typeConfig, sanitizeCases, integrityService) {
        describe('sanitize', function() {
            sanitizeCases.forEach(([unsafeValue, expectedValue]) => {
                it(`sanitizes '${stringify(unsafeValue)}' to '${stringify(expectedValue)}'`, function() {
                    const actualValue = integrityService
                        ? integrityService.sanitize(typeConfig, unsafeValue)
                        : typeObj.sanitize(unsafeValue, typeConfig)
                    expect(actualValue).to.deep.equal(expectedValue)
                })
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
