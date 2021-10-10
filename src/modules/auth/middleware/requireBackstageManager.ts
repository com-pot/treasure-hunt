import { Middleware } from "koa"
import AppError from "../../../app/AppError"

export default (): Middleware => {
    return (ctx, next) => {
        if (!ctx.actionContext.actor) {
            throw new AppError('not-logged-in', 401, {error: 'unauthorized-for-backstage'})
        }
        if (!ctx.actionContext.actorRoles.includes('backstage')) {
            throw new AppError('unauthorized', 403, {error: 'unauthorized-for-backstage'})
        }

        return next()
    }
}
