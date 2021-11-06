import { Middleware } from "koa"
import AppError from "../AppError"

export default (): Middleware => {
    return async (ctx, next) => {
        if (ctx.method !== 'GET' && !ctx.is('application/json')) {
            throw new AppError('invalid-content-type', 400, {expectedType: 'application/json'})
        }

        await next()
    }
}
