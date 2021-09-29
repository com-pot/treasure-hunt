export default () => {
    return (ctx, next) => {
        if (!ctx.actionContext.actor) {
            throw Object.assign(new Error('not-logged-in'), {status: 401, details: {error: 'unauthorized-for-backstage'}})
        }
        if (!ctx.actionContext.actorRoles.includes('backstage')) {
            throw Object.assign(new Error('unauthorized'), {status: 403, details: {error: 'unauthorized-for-backstage'}})
        }

        return next()
    }
}
