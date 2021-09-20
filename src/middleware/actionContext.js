export default function actionContextFactory(jwtService) {
    return async function actionContext(ctx, next) {
        const authorizationHeader = ctx.request.headers['authorization']
        let actor = null

        if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
            const token = authorizationHeader.substr('Bearer '.length)

            try {
                const payload = jwtService.parseValid(token)
                actor = payload.login
            } catch (e) {
                throw Object.assign(new Error('token-invalid'), {status: 401, details: {message: e.message}})
            }
        }

        ctx.actionContext = {
            actor,
            moment: new Date(),
        }

        await next()
    }
}
