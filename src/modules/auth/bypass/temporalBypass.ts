import { Middleware } from "koa"
import { ParsedUrlQuery } from "querystring"
import { ActionContext } from "../../../app/middleware/actionContext"

type BypassOpts = {
    query: Record<string, any>,
    validThrough: Date,
    paths: string[],
}

export function createTemporalBypass(opts: BypassOpts): (ctx: Parameters<Middleware>[0]) => boolean {
    const queryEntries = Object.entries(opts.query)
    const queryMatches = (query: ParsedUrlQuery): boolean => {
        return queryEntries.every(([name, value]) => query[name] === value)
    }
    return (ctx) => {
        if (!queryMatches(ctx.query)) return false
        
        const actionCtx = ctx.actionContext as ActionContext
        if (actionCtx.moment > opts.validThrough) {
            return false
        }
        const matchingPath = opts.paths.find((path) => ctx.path.includes(path))
        if (!matchingPath) return false

        return true
    }
}
