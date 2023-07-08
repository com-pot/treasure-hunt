import { describe } from "vitest"
import typeSpec from "../test/typeSpec"
import array from "./array"

const integrityService = typeSpec.createIntegrityService()

describe('types/array - any config', function() {
    const validValues = [[1, 2], []]
    const invalidValues = [0, 1, -1, 'hi', null, undefined]

    const anyConfig = {type: 'array'}
    typeSpec.validateType(array, anyConfig, validValues, invalidValues, integrityService)
    typeSpec.sanitizeValues(array, anyConfig, [
        [[1, 2], [1, 2]],
        [false, null],
        [1, null],
        ['hello', null],
    ])
})

describe('types/array - number config', function() {
    const itemsNumberConfig = {type: "array", items: {type: "number"}}
    typeSpec.validateType(array, itemsNumberConfig, [
        [],
        [1, 2, 3],
        [Number.MAX_SAFE_INTEGER, 0.1],
    ], [
        ["a"],
        [1, 2, "c"],
    ], integrityService)
})
