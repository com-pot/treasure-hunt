import { describe, expect, it } from "vitest";
import { RefPath, SchemaField, getSchemaField } from "./typeSystem";

import modelSchema from "./model/model";
import { stringify } from "./test/typeSpec";

describe("getSchemaField", () => {
    const cases: [SchemaField, string | RefPath][] = [
        [
            { type: "string" },
            ["name"],
        ],
        [
            { type: "object", additionalProperties: true, format: "json" },
            "schema",
        ],
        [
            { type: 'string', format: "url:path" },
            "endpoints.entityAny",
        ],
        [
            { type: 'string', format: "url:path" },
            ["endpoints", "entityAny"],
        ],
    ]

    cases.forEach(([expectedSchema, path]) => it(stringify(path), () => {
        const result = getSchemaField(modelSchema, path)
        expect(result).to.deep.equal(expectedSchema)
    }))
})
