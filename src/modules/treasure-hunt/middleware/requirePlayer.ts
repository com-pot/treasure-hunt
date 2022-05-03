import { Middleware } from "koa"
import AppError from "../../../app/AppError"
import TypefulAccessor from "../../typeful/services/TypefulAccessor"
import { PlayerService } from "../model/player.service"


export default (tfa: TypefulAccessor): Middleware => {
    return async (ctx, next) => {
        if (!ctx.actionContext.actor) {
            throw new AppError('not-logged-in', 401, {error: 'no-player'})
        }
        const story = ctx.actionContext.tenant
        const players = tfa.getModel<PlayerService>('treasure-hunt.player')

        let player = await players.dao.findOne(ctx.actionContext, {user: ctx.actionContext.actor, story})
        if (!player) {
            player = await players.createPlayer(ctx.actionContext, ctx.actionContext.actor, story)
        }

        /** @deprecated */
        ctx.player = player
        ctx.actionContext.player = player
        await next()
    }
}
