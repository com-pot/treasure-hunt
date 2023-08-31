import { describe } from "vitest"
import typeSpec from "../test/typeSpec"
import schema, { SchemaSpec } from "./object"

describe('types/schema', function() {
    const schemaConfig: SchemaSpec = {
        type: 'object',
        properties: {
            name: {type: 'string', defaultValue: 'document'},
            format: {type: 'string'},
            pageCount: {type: 'number'},
        },
        required: [
            "format",
        ],
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

    const nestedConfig: SchemaSpec = {
        type: 'object',
        properties: {
            stats: {
                type: 'object',
                properties: {
                    createdAt: {type: 'string'},
                },
                required: ["createdAt"]
            },
        },
        required: ["stats"],
    }
    describe('nested config - ' + typeSpec.stringify(nestedConfig), function() {
        const integrityService = typeSpec.createIntegrityService()

        const validValues = [
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
