import mongodb from "mongodb"

/**
 * @param {mongodb.MongoClient} mongoClient
 */
export default (mongoClient) => {
    return async (ctx, next) => {
        if (!ctx.actionContext.actor) {
            throw Object.assign(new Error('not-logged-in'), {status: 401, details: {error: 'no-player'}})
        }
        const players = mongoClient.db().collection('treasure-hunt.player')

        const player = await players.findOne({login: ctx.actionContext.actor})
        if (!player) {
            throw Object.assign(new Error('missing-player'), {status: 403, details: {error: 'no-player'}})
        }

        ctx.player = player
        await next()
    }
}
