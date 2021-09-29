export default function actionContextFactory(jwtService, mongoClient) {
    return async function actionContext(ctx, next) {
        const authorizationHeader = ctx.request.headers['authorization']
        let actor = null, roles = []

        if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
            const token = authorizationHeader.substr('Bearer '.length)

            try {
                const payload = jwtService.parseValid(token)
                actor = payload.login
            } catch (e) {
                throw Object.assign(new Error('token-invalid'), {status: 401, details: {message: e.message}})
            }

            const users = mongoClient.db().collection('auth.user')
            const user = await users.findOne({login: actor})
            if (!user) {
                console.warn(`User '${login}' not found`);
            } else {
                roles = user.roles || [];
            }
        }

        ctx.actionContext = {
            actor,
            actorRoles: roles,
            moment: new Date(),
        }

        await next()
    }
}
