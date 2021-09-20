import typeSpec from "../test/typeSpec.js"
import list from "./list.js"

describe('types/list', function() {
    const validValues = [[1, 2], []]
    const invalidValues = [0, 1, -1, 'hi', null, undefined]
    
    const anyConfig = {type: 'list'}
    typeSpec.validateType(list, anyConfig, validValues, invalidValues)
    typeSpec.sanitizeValues(list, anyConfig, [
        [[1, 2], [1, 2]],
        [false, null],
        [1, null],
        ['hello', null],
    ])

    // TODO: Validate and sanitize by innerType
})
