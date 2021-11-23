import { Middleware } from "koa/index"
import { AuthTokenPayload } from "../../modules/auth/auth"
import { UserEntity } from "../../modules/auth/model/user"

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
        let actor: string|null = null,
            roles: string[] = []

        if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
            const token = authorizationHeader.substr('Bearer '.length)

            try {
                const payload: AuthTokenPayload = jwtService.parseValid(token)
                actor = payload.login
            } catch (e: unknown) {
                throw new AppError('token-invalid', 401, {message: (e as Error).message})
            }

            const users = tfa.getDao<UserEntity>('auth.user')
            const user = await users.findOne(ctx.actionContext, {login: actor})
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
