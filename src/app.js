import Koa from "koa";
import cors from "@koa/cors";
import koaBodyparser from "koa-bodyparser";

import glob from "glob";
import path from "path";

import actionContextFactory from "./middleware/actionContext.js";
import errorHandling from "./middleware/errorHandling.js";
import {EventEmitter} from "events";
import Router from "@koa/router";

const getModules = async () => {
    const cwd = path.resolve(process.cwd(), 'src')
    const files = glob.sync('modules/**/*.appModule.js', {
        cwd,
    })

    const modules = await Promise.all(files.map(async (file) => {
        const name = path.parse(file).base.replace(/\.appModule\.js$/, '')
        const module = await import('./' + file)
        
        return [name, module]
    }))

    return Object.fromEntries(modules)
}

const createServiceContainer = async (modules) => {
    const serviceContainer = {
        modules,
        eventBus: new EventEmitter()
    }

    const allPrepared = Object.entries(serviceContainer.modules).map(async ([name, module]) => {
        await (module.compose && module.compose(serviceContainer))
    })
    await Promise.all(allPrepared)

    return serviceContainer
}

export const createApp = async () => {
    const serviceContainer = await createServiceContainer(await getModules())

    const app = new Koa()
    app.use(cors({
        origin: process.env.REMOTE_ORIGIN || '*',
    }))
    app.use(koaBodyparser())

    app.use(errorHandling());
    app.use(actionContextFactory(serviceContainer.jwtService))

    const appRouter = new Router({
        prefix: process.env.APP_SUBFOLDER,
    })

    const allReady = Object.entries(serviceContainer.modules).map(async ([name, module]) => {
        const moduleData = await (module.startUp && module.startUp(serviceContainer))
        let router = module.router || (moduleData && moduleData.router)
        if (!router) {
            return
        }

        appRouter.use(router.routes())
        appRouter.use(router.allowedMethods())
    })

    await Promise.all(allReady)
    app.use(appRouter.routes())
    app.use(appRouter.allowedMethods())

    app.use(async (ctx, next) => {
        await next()
        if (ctx.status === 404 && (!ctx.body || ctx.body === "Not Foubd")) {
            throw Object.assign(new Error('not-found'), {status: 404, details: 'route-not-found'})
        }
    })
    
    return app
}

createApp()
    .then((app) => {
        let port = process.env.APP_PORT || 3000
        app.listen(port, () => {
            console.log("listening on " + port);
        })
    })
    .catch((err) => {
        console.error(err);
        process.exit(1)
    })
