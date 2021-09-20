import mongodb from "mongodb"
import bcrypt from "bcrypt"

export default class AuthController {
    constructor(mongoClient, jwtService) {
        /** @type {mongodb.MongoClient} */
        this.mongoClient = mongoClient
        this.jwtService = jwtService

    }

    async signUp(action, credentials) {
        const {login, pass} = credentials || {}
        if (!login || !pass) {
            throw Object.assign(new Error('missing-credentials'), {status: 400})
        }

        const users = this.mongoClient.db().collection('auth.user')

        const user = await users.findOne({login})
        if (user) {
            throw new Object.assign(new Error('login-taken'), {status: 409})
        }

        const newUser = {
            login,
            loginMethods: [
                {type: 'pass', hash: bcrypt.hashSync(pass, 10)}
            ]
        }

        const result = await users.insertOne(newUser)
        if (!result.acknowledged) {
            throw new Error('update-error.unacknowledged')
        }

        return true

    }

    async signIn(action, credentials) {
        const {login, pass} = credentials || {}
        if (!login || !pass) {
            throw Object.assign(new Error('missing-credentials'), {status: 400})
        }

        const users = this.mongoClient.db().collection('auth.user')

        const user = await users.findOne({login})
        const loginMethod = user && user.loginMethods && user.loginMethods[0]
        if (!loginMethod) {
            bcrypt.hashSync(pass, 10)
            throw new Object.assign(new Error('invalid-credentials'), {status: 401})
        }

        if (!bcrypt.compareSync(pass, loginMethod.hash)) {
            throw new Object.assign(new Error('invalid-credentials'), {status: 401})
        }

        const token = this.jwtService.create({login}, {duration: 7 * 24 * 60 * 1000})

        return {
            token: token,
        }
    }

    async getUserData(action) {
        if (!action.actor) {
            throw Object.assign(new Error('forbidden'), {status: 403})
        }

        const users = this.mongoClient.db().collection('auth.user')

        const user = await users.findOne({login: action.actor})
        if (!user) {
            throw new Object.assign(new Error('login-not-found'), {status: 404})
        }

        delete user._id
        delete user.loginMethods
        
        return user
    }
}
