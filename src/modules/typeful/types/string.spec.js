import { describe } from "vitest"
import typeSpec from "../test/typeSpec"
import string from "./string"

describe("types/string", () => {
    describe("simple onfig", () => {
        const schemaConfig = {type: "string"}
        typeSpec.validateType(string, schemaConfig, [
            "",
            "a",
            "💠",
            "foobarbaz".repeat(1000),
        ], [
            undefined,
            null,
            0, 1,
            [],
        ])
    })

    describe("min max length config", () => {
        const schemaConfig = {type: "string", minLength: 2, maxLength: 5}
        typeSpec.validateType(string, schemaConfig, [
            "ab",
            "abc",
            "abcde",
        ], [
            "",
            "a",
            "abcdef"
        ])
    })

    describe("enum config", () => {
        const schemaConfig = {type: "string", enum: ["plain", "rich", "html"]}
        typeSpec.validateType(string, schemaConfig, [
            "plain",
            "rich",
            "html",
        ], [
            "custom",
        ])
    })

})
