import { describe, it, expect } from "vitest"
import testUtils from "../utils/testUtils.mjs"
import ApiAdapter from "../utils/ApiAdapter.mjs"

describe('app authorization', function() {
    /** @type {ApiAdapter} */
    let api
    try {
        api = testUtils.useApi()
    } catch (e) {
        console.warn("testUtils.useApi unavailable", e)
    }

    describe.skipIf(!api)('should be possible to sign up and sign in to the new account', async function() {
        const login = 'danny-de-' + Date.now()
        const pass = '1337-p455w0Rdt^'

        let createResult
        it('creates account', async function() {
            const result = await api.json.post('/auth/account', { login, pass })

            expect(result).to.deep.equal({
                status: 'ok',
            })
            createResult = result
        })

        let loginResult
        it('signs into newly created account', async function(t) {
            if (!createResult) throw new Error("dependency-failed:createResult")

            const result = await api.json.post('/auth/auth-token', { login, pass })
            expect(result.token).to.be.a('string')
            loginResult = result
        })

        it('retrieves user data', async function() {
            if (!loginResult) throw new Error("dependency-failed:loginResult")
            const result = await api.json.get('/auth/account', {
                auth: loginResult.token,
            })

            expect(result.login).to.equal(login)
        })

        it.skip("receives error with forged token", () => {
            // TODO: verify that forged tokens are rejected
        })
    })

})
