import { expect } from "chai"
import dummyItemModelEntry from "../../test/dummyItemModelEntry"
import { FilterCriteria } from "./Daos"
import mongoAggregators from "./mongoAggregators"

describe('mongAggregators', function() {
    describe('filter', function() {
        const cases: [FilterCriteria, unknown][] = [
            [
                420,
                {id: {$eq: 420}},
            ],

            [
                ['age', 'eq', 69],
                {age: {$eq: 69}},
            ],
            [
                ['!age', 'eq', 69],
                {age: {$ne: 69}},
            ],
            [
                {age: 69},
                {age: {$eq: 69}},
            ],
            [
                {'!age': 69},
                {age: {$ne: 69}},
            ],

            [
                ['age', 'in', [37, 42]],
                {age: {$in: [37, 42]}},
            ],
            [
                ['!age', 'in', [37, 42]],
                {age: {$nin: [37, 42]}},
            ],
            [
                ['age', 'nin', [66, 13]],
                {age: {$nin: [66, 13]}},
            ],
            [
                ['!age', 'nin', [66, 13]],
                {age: {$in: [66, 13]}},
            ],

            [
                {age: [15, 20]},
                {age: {$in: [15, 20]}},
            ],
            [
                {'!age': [15, 25]},
                {age: {$nin: [15, 25]}},
            ],

            [
                {author: {_id: 'g00b3R'}},
                {author: {$eq: 'g00b3R'}},
            ],
            [
                {author: [{_id: 'g00b3R'}, {_id: '81780'}]},
                {author: {$in: ['g00b3R', '81780']}},
            ],
        ]

        cases.forEach(([arg, expectedOut], i) => {
            it(`#${i + 1}. Prepares ` + JSON.stringify(arg), function() {
                const actualValue = mongoAggregators.filter(arg, dummyItemModelEntry)

                expect(actualValue).to.deep.equal(expectedOut)
            })
        })
    })
})
