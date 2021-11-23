import { Middleware } from "koa"
import AppError from "../../../app/AppError"
import TypefulAccessor from "../../typeful/services/TypefulAccessor"


export default (tfa: TypefulAccessor): Middleware => {
    return async (ctx, next) => {
        if (!ctx.actionContext.actor) {
            throw new AppError('not-logged-in', 401, {error: 'no-player'})
        }
        const players = tfa.getDao('treasure-hunt.player')

        const player = await players.findOne(ctx.actionContext, {user: ctx.actionContext.actor})
        if (!player) {
            throw new AppError('missing-player', 403, {error: 'no-player'})
        }

        ctx.player = player
        await next()
    }
}
