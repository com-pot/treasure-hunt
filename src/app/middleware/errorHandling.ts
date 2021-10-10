import { Middleware } from "koa";
import AppError, {isAppError} from "../AppError";

export default (): Middleware => {
    return async (ctx, next) => {
        try {
            await next();
        } catch (err: any) {
            if (isAppError(err) || err.message === 'not-found') {
                let status = err.message === 'not-found' && 404;
                ctx.status = status || err.status || 500;
                ctx.body = {error: err.message};
                if (err.details) {
                    ctx.body.details = err.details
                }
            } else {
                ctx.status = 500
                ctx.body = {error: 'unhandled-error'}
            }
            
            
            ctx.app.emit('error', err, ctx); // todo: handle error?
        }
    }
}
