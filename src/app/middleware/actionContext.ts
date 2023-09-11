import { Middleware, Request } from "koa/index"
import { AuthTokenPayload } from "../../modules/auth/auth"
import { UserEntity } from "../../modules/auth/model/user"

import JwtService, { TokenExpiredError } from "../../modules/auth/servies/JwtService"
import TypefulAccessor from "../../modules/typeful/services/TypefulAccessor"
import AppError from "../AppError"
import appLogger from "../appLogger"

export type ActionContext = {
    tenant: string,
    actor: string|null,
    actorRoles: string[],
    moment: Date,

    [key: string]: unknown,
}

type ActionContextDevOptions = {
    devAuthCode?: string,
}

// TODO: Avoid using devOptions, consider introducing system/dev accounts properly
export default function actionContextFactory(jwtService: JwtService, tfa: TypefulAccessor, devOptions?: ActionContextDevOptions): Middleware {
    const logger = appLogger.child({section: "actionContext"})

    async function loadActor(authorizationHeader: string | undefined) {
        if (!authorizationHeader?.startsWith('Bearer ')) return null

        const token = authorizationHeader.substr('Bearer '.length)

        let actor: string
        let roles: string[]
        try {
            const payload: AuthTokenPayload = jwtService.parseValid(token)
            actor = payload.login
        } catch (e: unknown) {
            let reason = "unknown"
            if (e instanceof TokenExpiredError) {
                reason = "token-expired"
                console.log(e)
            }
            throw new AppError('token-invalid', 401, {message: (e as Error).message, reason})
        }

        const users = tfa.getDao<UserEntity>('auth.user')
        const user = await users.findOne({} as any, {login: actor})
        if (!user) {
            logger.warn({actor}, `User not found`);
            roles = []
        } else {
            roles = user.roles || [];
        }

        return { actor, roles }
    }

    function getCurrentMoment(timeTravelHeader: string[] | string | undefined): Date {
        const moment = new Date()
        if (timeTravelHeader  && process.env.DEBUG_ALLOW_TIME_TRAVEL) {
            moment.setDate(moment.getDate() + 4)
        }
        return moment
    }

    function getTenant(tenantHeader: Request["headers"][string]): string {
        let tenant = Array.isArray(tenantHeader) ? tenantHeader[0] : tenantHeader
        if (!tenant) tenant = process.env.TENANT_NAME
        if (!tenant) throw new AppError("tenant-unavailable", 503)
        return tenant
    }

    async function createActionContext(request: Request): Promise<ActionContext> {
        const actorObj = await loadActor(request.headers['authorization'])

        const actionContext: ActionContext = {
            tenant: getTenant(request.header['tenant']),
            actor: actorObj?.actor ?? null,
            actorRoles: actorObj?.roles ?? [],
            moment: getCurrentMoment(request.headers['time-travel']),
        }

        if (devOptions?.devAuthCode && devOptions?.devAuthCode === request.query.devAuth) {
            actionContext.actor = actionContext.actor || 'anon-dev'
            actionContext.actorRoles.push('backstage')
        }

        return actionContext
    }

    return async function actionContext(ctx, next) {
        ctx.actionContext = await createActionContext(ctx.request)
        await next()
    }
}
