import testUtils from "../utils/testUtils.js"

describe('app authorization', function() {
    const api = testUtils.useApi()
    
    describe('should be possible to sign up and sign in to the new account', function() {
        const login = 'danny-de-' + Date.now()
        const pass = '1337-p455w0Rdt^'
        
        let createResult
        it ('creates account', async function() {
            const result = await api.json.post('/auth/account', {login, pass})
            
            expect(result).to.deep.equal({
                status: 'ok',
            })
            createResult = result
        })
        
        let loginResult
        it ('signs into newly created account', async function() {
            if (!createResult) {
                this.skip('create was not successful')
            }

            const result = await api.json.post('/auth/auth-token', {login, pass})
            expect(result.token).to.be.a('string')
            loginResult = result
        })

        it ('retrieves user data', async function() {
            if (!loginResult) {
                this.skip('login was not successful')
            }

            const result = await api.json.get('/auth/account', {
                auth: loginResult.token,
            })

            expect(result.login).to.equal(login)
        })
    })

    // TODO: verify that forged tokens are rejected
})
