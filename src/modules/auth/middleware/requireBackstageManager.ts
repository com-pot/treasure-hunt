import { Middleware } from "koa"
import AppError from "../../../app/AppError"

type RequireBackstageManagerMiddlewareOpts = {
    shouldBypass?: (ctx: Parameters<Middleware>[0]) => boolean,
}
export default function creatteBackstageManagerRequireMiddleware(opts?: RequireBackstageManagerMiddlewareOpts): Middleware {
    
    return (ctx, next) => {
        if (opts?.shouldBypass?.(ctx)) return next()

        if (!ctx.actionContext.actor) {
            throw new AppError('not-logged-in', 401, {error: 'unauthorized-for-backstage'})
        }
        if (!ctx.actionContext.actorRoles.includes('backstage')) {
            throw new AppError('unauthorized', 403, {error: 'unauthorized-for-backstage'})
        }

        return next()
    }
}
