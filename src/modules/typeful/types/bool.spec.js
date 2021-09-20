import typeSpec from "../test/typeSpec.js"
import bool from "./bool.js"

describe('types/bool', function() {
    const validValues = [true, false]
    const invalidValues = [0, 1, -1, 'hi', null, undefined]
    
    typeSpec.validateType(bool, {type: 'bool'}, validValues, invalidValues)
    typeSpec.sanitizeValues(bool, {type: 'bool'}, [
        [true, true],
        [false, false],
        [1, true],
        [0, false],
        ['true', true],
        ['false', false],
        
        [undefined, undefined],
        [null, null],
        ['hello', null],
    ])
})
