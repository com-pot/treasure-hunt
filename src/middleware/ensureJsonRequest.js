export default () => {
    return async (ctx, next) => {
        if (ctx.method !== 'GET' && !ctx.is('application/json')) {
            throw Object.assign(new Error('invalid-content-type'), {status: 400, details: {expectedType: 'application/json'}})
        }

        await next()
    }
}
