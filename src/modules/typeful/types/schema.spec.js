import typeSpec from "../test/typeSpec.js"
import schema from "./schema.js"

describe('types/list', function() {    
    const schemaConfig = {
        type: 'schema',
        fields: {
            name: {type: 'string', defaultValue: 'document'},
            format: {type: 'string', required: true},
            pageCount: {type: 'number'},
        },
    }
    
    describe('simple config - ' + typeSpec.stringify(schemaConfig), function() {
        const validValues = [{format: 'A4'}, {format: 'A4', name: 'Ode to joy'}]
        const invalidValues = [0, 1, -1, 'hi', null, undefined, {pageCount: 6}]

        typeSpec.validateType(schema, schemaConfig, validValues, invalidValues)
        typeSpec.sanitizeValues(schema, schemaConfig, [
            [{format: 'A5'}, {format: 'A5', name: 'document'}],
            [{format: 'A5', illegalSIgnature: 'yooooo'}, {format: 'A5', name: 'document'}],
            [{format: 'A5', pageCount: 37}, {format: 'A5', name: 'document', pageCount: 37}],
        ])
    })

    const nestedConfig = {
        type: 'schema',
        fields: {
            stats: {
                type: 'schema',
                fields: {
                    createdAt: {type: 'string', required: true},
                }
            }
        },
    }
    describe('nested config - ' + typeSpec.stringify(nestedConfig), function() {
        const integrityService = typeSpec.createIntegrityService()

        const validValues = [
            {},
            {stats: {createdAt: 'now'}},
            {stats: {createdAt: 'now', author: 'them'}},
        ]
        const invalidValues = [{stats: 'what'}, {stats: {}}, {stats: []}]

        typeSpec.validateType(schema, nestedConfig, validValues, invalidValues, integrityService)
        typeSpec.sanitizeValues(schema, nestedConfig, [
            [{}, {}],
            [{name: 'I'}, {}],
            [{stats: {createdAt: 'now'}}, {stats: {createdAt: 'now'}}],
            [{stats: {createdAt: 'now'}, sond: 'meow'}, {stats: {createdAt: 'now'}}],
        ], integrityService)
    })
    
    
    // TODO: Validate and sanitize by innerType
})
