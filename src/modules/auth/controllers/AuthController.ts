import {EventEmitter} from "events"
import bcrypt from "bcrypt"

import JwtService from "../servies/JwtService"
import { ActionContext } from "../../../app/middleware/actionContext"
import AppError from "../../../app/AppError"
import TypefulAccessor from "../../typeful/services/TypefulAccessor"
import { UserEntity } from "../model/user"

type UserCredentials = {
    login: string,
    pass: string,
}

export default class AuthController {
    constructor(private tfa: TypefulAccessor, private jwtService: JwtService, private eventBus: EventEmitter) {

    }

    async signUp(action: ActionContext, credentials: UserCredentials) {
        const {login, pass} = credentials || {}
        if (!login || !pass) {
            throw new AppError('missing-credentials', 400)
        }

        const users = this.tfa.getDao<UserEntity>('auth.user')

        const user = await users.findOne(action, {login})
        if (user) {
            throw new AppError('login-taken', 409)
        }

        const newUser = {
            login,
            loginMethods: [
                {type: 'pass', hash: bcrypt.hashSync(pass, 10)}
            ]
        }

        const result = await users.create(action, newUser)

        const promises: Promise<void>[] = []
        this.eventBus.emit('auth.user-registered', {action, user: newUser, promises})

        await Promise.all(promises)

        return result

    }

    async signIn(action: ActionContext, credentials: UserCredentials) {
        const {login, pass} = credentials || {}
        if (!login || !pass) {
            throw new AppError('missing-credentials', 400)
        }

        const users = this.tfa.getDao<UserEntity>('auth.user')

        const user = await users.findOne(action, {login})

        const loginMethod = user && user.loginMethods && user.loginMethods[0]
        if (!loginMethod) {
            bcrypt.hashSync(pass, 10)
            throw new AppError('invalid-credentials', 401)
        }

        if (!bcrypt.compareSync(pass, loginMethod.hash)) {
            throw new AppError('invalid-credentials')
        }

        const token = this.jwtService.create({login}, {duration: 7 * 24 * 60 * 1000})

        return {
            token: token,
        }
    }

    async getUserData(action: ActionContext) {
        if (!action.actor) {
            throw new AppError('unauthorized', 401)
        }

        const users = this.tfa.getDao<UserEntity>('auth.user')

        const user = await users.findOne(action, {login: action.actor})
        if (!user) {
            throw new AppError('login-not-found', 404)
        }

        delete (user as Record<string, unknown>)._id
        delete user.loginMethods

        return user
    }

    async updatePassword(action: ActionContext, newPass: string, subject: string) {
        if (!action.actor) {
            throw new AppError('unauthorized', 401)
        }

        if (!newPass) {
            throw new AppError('bad-request', 400, 'missing-password')
        }

        if (!subject) {
            subject = action.actor
        }
        if (subject !== action.actor && !action.actorRoles.includes('backstage')) {
            throw new AppError('forbidden', 403, 'unauthorized-to-change-others-password')
        }

        const users = this.tfa.getDao<UserEntity>('auth.user')

        const user = await users.findOne(action, {login: action.actor})
        if (!user) {
            throw new AppError('login-not-found', 404)
        }

        await users.update(action, {login: subject}, {
            loginMethods: [
                {type: 'pass', hash: bcrypt.hashSync(newPass, 10)}
            ]
        })

        return {status: 'ok'}
    }
}
