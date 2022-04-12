import Router from '@koa/router'

const requirePlayer =  require('./middleware/requirePlayer').default
const PlayerController =  require('./controllers/PlayerController').default
const DashboardController = require('./controllers/DashboardController').default

export const entities = {
    player: {
        primaryKey: 'login',
    },
    story: {
        plural: 'stories',
    },
    'story-part': {
        primaryKey: 'slug',
    },
    'challenge-type': {
        primaryKey: 'type',
        persistence: 'static',
    },
    challenge: {
        stringify: {
            template: '{{name}} [{{id}}]',
        }
    },
}

const createPlayerRouter = (serviceContainer) => {
    const router = new Router()
    router.use('/progression', requirePlayer(serviceContainer.typefulAccessor))

    const playerCtrl = new PlayerController(serviceContainer.typefulAccessor)
    router.get('/progression', async (ctx) => {
        ctx.body = await playerCtrl.getProgressionData(ctx.actionContext, ctx.player)
    })

    router.get('/progression/:slug', async (ctx) => {
        ctx.body = await playerCtrl.getStoryPart(ctx.actionContext, ctx.player, ctx.params.slug)
    })

    router.post('/progression/:slug/answer', async (ctx) => {
        ctx.body = await playerCtrl.checkChallengeAnswer(ctx.actionContext, ctx.player, ctx.params.slug, ctx.request.body)
    })

    return router
}

const createBackstageRouter = (serviceContainer) => {
    const router = new Router({prefix: '/treasure-hunt'})

    const dashCtrl = new DashboardController(serviceContainer.typefulAccessor)

    router.get('/dashboard/story/:story/players', async (ctx) => {
        ctx.body = await dashCtrl.getPlayersDashboard(ctx.actionContext, ctx.params.story)
    })

    router.post('/dashboard/story/:story/player/:login/trophy/redeem', async (ctx) => {
        ctx.body = {
            trophy: await dashCtrl.redeemTrophy(ctx.actionContext, ctx.params.login),
        }
    })

    router.get('/dashboard/story/:story', async (ctx) => {
        ctx.body = await dashCtrl.getStoryDashboard(ctx.actionContext, ctx.query.story)
    })

    return router
}

export const startUp = async (serviceContainer) => {
    const router = new Router({
        prefix: '/treasure-hunt',
    })

    serviceContainer.eventBus.on('auth.user-registered', function({action, user, promises}) {
        const playerModel = serviceContainer.typefulAccessor.getModel('treasure-hunt.player')
        const createPlayerPromise = playerModel.createPlayer(action, user.login, action.tenant)
        promises && promises.push(createPlayerPromise)
    })

    const playerRouter = createPlayerRouter(serviceContainer)
    router.use(playerRouter.routes(), playerRouter.allowedMethods())

    return {
        router,
        backstageRouter: createBackstageRouter(serviceContainer),
    }
}

export const plugins = {
    executive: require('./treasure-hunt.executiveModule').default
}
