import { Middleware } from "koa/index"

import JwtService from "../../modules/auth/servies/JwtService"
import TypefulAccessor from "../../modules/typeful/services/TypefulAccessor"
import AppError from "../AppError"

export type ActionContext = {
    tenant: string,
    actor: string|null,
    actorRoles: string[],
    moment: Date,
}

type ActionContextDevOptions = {
    devAuthCode?: string,
}

// TODO: Avoid using devOptions, consider introducing system/dev accounts properly
export default function actionContextFactory(jwtService: JwtService, tfa: TypefulAccessor, devOptions?: ActionContextDevOptions): Middleware {
    return async function actionContext(ctx, next) {
        const authorizationHeader = ctx.request.headers['authorization']
        let actor = null, roles = []

        if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
            const token = authorizationHeader.substr('Bearer '.length)

            try {
                const payload: any = jwtService.parseValid(token)
                actor = payload.login
            } catch (e) {
                throw new AppError('token-invalid', 401, {message: (e as any).message})
            }

            const users = tfa.getDao('auth.user')
            const user = await users.findOne!(ctx.actionContext, {login: actor})
            if (!user) {
                console.warn(`User '${actor}' not found`);
            } else {
                roles = user.roles || [];
            }
        }

        ctx.actionContext = {
            tenant: process.env.TENANT_NAME, // TODO: this might be decided based on routes or different logic
            actor,
            actorRoles: roles,
            moment: new Date(),
        }

        if (devOptions?.devAuthCode === ctx.query.devAuth) {
            ctx.actionContext.actor = ctx.actionContext.actor || 'anon-dev'
            ctx.actionContext.actorRoles.push('backstage')
        }

        await next()
    }
}
