export default () => {
    return async (ctx, next) => {
        try {
            await next();
        } catch (err) {
            let status = err.message === 'not-found' && 404;
            ctx.status = status || err.status || 500;
            ctx.body = {error: err.message};
            if (err.details) {
                ctx.body.details = err.details
            }

            ctx.app.emit('error', err, ctx); // todo: handle error?
        }
    }
}
