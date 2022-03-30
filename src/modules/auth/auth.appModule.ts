import Router from "@koa/router"
import { ServiceContainer } from "../../app/types/app.js"
import ensureJsonRequest from "../../app/middleware/ensureJsonRequest"
import AuthController from "./controllers/AuthController"

import JwtService from "./servies/JwtService"
import { EntitySpec } from "../typeful/typeful.js"

export const entities: Record<string, EntitySpec> = {
    user: {
        publish: false,
    },
}

type AuthConfig = {
    authSecret: string
}

export const compose = async (serviceContainer: ServiceContainer, config: AuthConfig) => {
    serviceContainer.jwtService = new JwtService({
        secret: config.authSecret,
    })
}

export const startUp = async (serviceContainer: ServiceContainer) => {
    const ctrl = new AuthController(serviceContainer.typefulAccessor, serviceContainer.jwtService, serviceContainer.eventBus)

    const router = new Router({
        prefix: '/auth',
    })
    router.use(ensureJsonRequest())

    router.post('/account', async (ctx) => {
        await ctrl.signUp(ctx.actionContext, ctx.request.body)

        ctx.body = {status: 'ok'}
    })
    router.get('/account', async (ctx) => {
        ctx.body = await ctrl.getUserData(ctx.actionContext)
    })

    router.post('/auth-token', async (ctx) => {
        ctx.body = await ctrl.signIn(ctx.actionContext, ctx.request.body)
    })

    router.put('/user/:login/password', async (ctx) => {
        ctx.body = await ctrl.updatePassword(ctx.actionContext, ctx.request.body.password, ctx.params.login)
    })

    return {
        router,
    }
}
