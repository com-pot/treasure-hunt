import Router from '@koa/router'

import playerModel from './model/player.js'
import playerService from './model/player.service.js'

import storyModel from './model/story.js'
import storyPartModel from './model/story-part.js'
import challengeTypeModel from './model/challenge-type.js'
import challengeTypeSotwData from './data/challenge-type.js'
import challengeModel from "./model/challenge.js"
import challengeData from "./data/challenge.js"

import PlayerController from './controllers/PlayerController.js'

import requirePlayer from './middleware/requirePlayer.js'
import DashboardController from './controllers/DashboardController.js'

export const entities = {
    player: {
        model: playerModel,
        service: playerService,
        strategy: {
            type: 'dao',
            primaryKey: 'login',
        }
    },
    story: {
        model: storyModel,
        plural: 'stories',
    },
    'story-part': {
        model: storyPartModel,
        strategy: {
            type: 'dao',
            primaryKey: 'slug',
        },
    },
    'challenge-type': {
        model: challengeTypeModel,
        strategy: {
            type: 'static',
            items: challengeTypeSotwData,
            primaryKey: 'type',
        },
    },
    challenge: {
        model: challengeModel,
        strategy: {
            type: 'static',
            items: challengeData.collection,
            formatItem: async (challenge) => {
                let challengeConfig = challenge.challengeConfig
                if (typeof challenge.challengeConfig === "function") {
                    challengeConfig = await challengeConfig()
                }

                return {
                    ...challenge,
                    challengeConfig,
                }
            },
        },
    },
}


const createPlayerRouter = (serviceContainer) => {
    const router = new Router()
    router.use('/progression', requirePlayer(serviceContainer.mongoClient))

    const playerCtrl = new PlayerController(serviceContainer.mongoClient, serviceContainer.model)
    router.get('/progression', async (ctx) => {
        ctx.body = await playerCtrl.getProgressionData(ctx.actionContext, ctx.player, 'sotw')
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

    const dashCtrl = new DashboardController(serviceContainer.mongoClient)

    router.get('/dashboard/players', async (ctx) => {
        ctx.body = await dashCtrl.getPlayersDashboard(ctx.actionContext)
    })

    router.post('/dashboard/player/:login/trophy/redeem', async (ctx) => {
        ctx.body = {
            trophy: await dashCtrl.redeemTrophy(ctx.actionContext, ctx.params.login),
        }
    })

    router.get('/dashboard/story', async (ctx) => {
        ctx.body = await dashCtrl.getStoryDashboard(ctx.actionContext, ctx.query.story)
    })

    return router
}

export const startUp = async (serviceContainer) => {
    const router = new Router({
        prefix: '/treasure-hunt',
    })

    serviceContainer.eventBus.on('auth.user-registered', function({user, promises}) {
        promises && promises.push(serviceContainer.model['treasure-hunt.player'].createPlayer(user.login, 'sotw'))
    })
    
    const playerRouter = createPlayerRouter(serviceContainer)
    router.use(playerRouter.routes(), playerRouter.allowedMethods())

    return {
        router,
        backstageRouter: createBackstageRouter(serviceContainer),
    }
}
