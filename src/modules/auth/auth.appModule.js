import Router from "@koa/router"
import ensureJsonRequest from "../../middleware/ensureJsonRequest.js"
import AuthController from "./controllers/AuthController.js"
import userModel from "./model/user.js"
import JwtService from "./servies/JwtService.js"

export const entities = {
    user: {
        publish: false,
        model: userModel
    },
}

export const compose = async (serviceContainer) => {
    serviceContainer.jwtService = new JwtService({
        secret: process.env.AUTH_SECRET,
    })
}

export const startUp = async (serviceContainer) => {
    const ctrl = new AuthController(serviceContainer.mongoClient, serviceContainer.jwtService, serviceContainer.eventBus)

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
