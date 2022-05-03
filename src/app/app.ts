import path from "path"
import Koa from "koa";
import Router from "@koa/router";
import cors from "@koa/cors";
import koaBodyparser from "koa-bodyparser";

import actionContextFactory from "./middleware/actionContext";
import errorHandling from "./middleware/errorHandling";
import requireBackstageManager from "../modules/auth/middleware/requireBackstageManager";
import AppError from "./AppError";
import { getModules } from "./bootstrap";
import { createServiceContainer } from "./serviceContainer";
import { loadFromFiles } from "./Config";


export const createApp = async () => {
    const config = await loadFromFiles(path.resolve(process.cwd(), 'src/config'))
    const modules = await getModules(path.resolve(process.cwd(), 'src/modules'))
    const serviceContainer = await createServiceContainer(modules, config)

    const app = new Koa()
    app.context.container = serviceContainer
    app.use(cors({
        origin: process.env.REMOTE_ORIGIN || '*',
    }))
    app.use(koaBodyparser())

    app.use(errorHandling());
    app.use(actionContextFactory(serviceContainer.jwtService, serviceContainer.typefulAccessor, {
        devAuthCode: process.env.BACKSTAGE_DEV_AUTH,
    }))

    const appRouter = new Router({
        prefix: process.env.APP_SUBFOLDER,
    })
    const backstageRouter = new Router({
        prefix: '/backstage',
    })
    backstageRouter.use(requireBackstageManager())

    const allReady = Object.entries(modules).map(async ([, module]) => {
        const moduleData = await (module.startUp?.(serviceContainer))
        const router = module.router || (moduleData?.router)
        if (router) {
            appRouter.use(router.routes())
            appRouter.use(router.allowedMethods())
        }

        const bsRouter = module.backstageRouter || (moduleData && moduleData.backstageRouter)
        if (bsRouter) {
            backstageRouter.use(bsRouter.routes())
            backstageRouter.use(bsRouter.allowedMethods())
        }
    })

    await Promise.all(allReady)

    appRouter.use(backstageRouter.routes())
    appRouter.use(backstageRouter.allowedMethods())
    app.use(appRouter.routes())
    app.use(appRouter.allowedMethods())


    app.use(async (ctx, next) => {
        await next()
        if (ctx.status === 404 && (!ctx.body || ctx.body === "Not Found")) {
            throw new AppError('not-found', 404, {reason: 'route-not-found'})
        }
    })

    return app
}

createApp()
    .then((app) => {
        const port = process.env.APP_PORT || 3000
        app.listen(port, () => {
            console.log("listening on " + port);
        })
    })
    .catch((err) => {
        console.error("App initialization error", err);
        process.exit(1)
    })
