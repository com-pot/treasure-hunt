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
        stringify: {
            template: '[{{key}}] {{title}}',
        },
    },
    'story-part': {
        primaryKey: 'slug',
        stringify: {
            template: '{{title}} [{{story}}#{{slug}}]'
        },
        defaultSort: {order: 1},
    },
    'challenge-type': {
        primaryKey: 'type',
        persistence: 'static',

        stringify: 'type',
    },
    challenge: {
        stringify: {
            template: '{{name}} [{{id}}]',
        }
    },

    clue: {
        primaryKey: 'slug',
        stringify: {
            template: '{{name}} [{{slug}}]',
        },
    }
}

const createPlayerRouter = (serviceContainer) => {
    const router = new Router()
    const ensurePlayer = requirePlayer(serviceContainer.typefulAccessor)
    router.use('/progression', ensurePlayer)
    router.use('/clue', ensurePlayer)
    router.use('/bag', ensurePlayer)

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

    router.post('/clue/:key', async (ctx) => {
        ctx.body = await playerCtrl.revealClue(ctx.actionContext, ctx.player, ctx.params.key)
    })

    router.post('/bag/inquiry', async (ctx) => {
        ctx.body = {
            items: await playerCtrl.checkBag(ctx.actionContext, ctx.request.body.items),
        }
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
    executive: require('./executive/treasure-hunt.executiveModule').default,
}
