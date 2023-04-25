import { describe } from "vitest"
import typeSpec from "../test/typeSpec"
import number from "./number"

describe('types/number', function() {
    const anyConfig = {type: 'number'}
    describe('with config ' + typeSpec.stringify(anyConfig), function() {
        const validValues = [0, 1, -1, 65535, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.MAX_VALUE, Number.MIN_VALUE]
        const invalidValues = [true, false, 'hi', null, undefined]
        const sanitizeCases: [unknown, unknown][] = [
            [1, 1],
            [0, 0],
            [1.5, 1.5],
            [true, null],
            [false, null],
            [undefined, undefined],
            [null, null],
        ]

        typeSpec.validateType(number, anyConfig, validValues, invalidValues)
        typeSpec.sanitizeValues(number, anyConfig, sanitizeCases)
    })

    const intConfig = {type: 'number', mode: 'int'}
    describe('with config ' + typeSpec.stringify(intConfig), function() {
        const validValues = [0, 1, 65535, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]
        const invalidValues = [true, false, 'hi', null, undefined, Number.MAX_VALUE, Number.MIN_VALUE]
        const sanitizeCases: [unknown, unknown][] = [
            [1, 1],
            [0, 0],
            [1.5, 1],
        ]

        typeSpec.validateType(number, intConfig, validValues, invalidValues)
        typeSpec.sanitizeValues(number, intConfig, sanitizeCases)
    })

    const minValueConfig = {type: 'number', minValue: 4.20}
    describe('with config' + typeSpec.stringify(minValueConfig), function() {
        typeSpec.validateType(number, minValueConfig, [4.20, 10, Number.MAX_SAFE_INTEGER], [4.19, 0, -4.20])
    })
})
