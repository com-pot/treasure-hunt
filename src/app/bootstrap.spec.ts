import { describe, expect, it } from "vitest";
import { parseModuleName } from "./bootstrap";

describe("parseModuleName", () => {
    const cases: [string, string][] = [
        ['auth', '/apps/treasure-hunt/src/modules/auth/auth.appModule.ts'],
        [
            'directory',
            '/apps/treasure-hunt/src/modules/directory/directory.appModule.js'
        ],
        [
            'treasure-hunt',
            '/apps/treasure-hunt/src/modules/treasure-hunt/treasure-hunt.appModule.js'
        ],
        [
            'typeful-executive',
            '/apps/treasure-hunt/src/modules/typeful-executive/typeful-executive.appModule.ts'
        ],
        [
            'typeful',
            '/apps/treasure-hunt/src/modules/typeful/typeful.appModule.ts'
        ],
        [
            '@compot/locations',
            '/apps/treasure-hunt/modules/@compot/locations/src/locations.appModule.ts'
        ],
    ]
    cases.forEach(([expectedName, fileName]) => it("parses " + fileName, () => {
        const name = parseModuleName(fileName)
        expect(name).to.equal(expectedName)
    }))

})
