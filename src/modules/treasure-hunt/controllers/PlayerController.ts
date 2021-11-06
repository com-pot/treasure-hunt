import AppError from "../../../app/AppError"
import { ActionContext } from "../../../app/middleware/actionContext"
import TypefulAccessor from "../../typeful/services/TypefulAccessor"
import { PlayerProgressionService } from "../model/player-progression.service"

export default class PlayerController {
    constructor(private readonly tfa: TypefulAccessor) {
        
    }
    
    async getProgressionData(actionContext: ActionContext, player: any) {
        const progressionModel = this.tfa.getModel<PlayerProgressionService>('treasure-hunt.player-progression')
        
        const progression = await progressionModel.getProgression(actionContext, player)
        
        const storyPartIds = progression.map((p) => p.storyPart)
        const storyParts = (await this.tfa.getDao('treasure-hunt.story-part').list!(actionContext, {_id: storyPartIds})).items
        
        return storyParts.map((sp) => {
            const progressItem = progression.find((p) => sp._id.equals(p.storyPart))
            
            return {
                title: sp.title,
                slug: sp.slug,
                challenge: sp.challenge,
                status: progressItem && progressItem.status,
            }
        })
    }
    
    async getStoryPart(action: ActionContext, player: any, partId: string) {
        const storyParts = this.tfa.getDao('treasure-hunt.story-part')
        const storyPart = await storyParts.findOne!(action, {slug: partId})
        if (!storyPart) {
            throw new AppError('not-found', 404, {entity: 'treasure-hunt.story-part'})
        }
        
        const progressionCollection = this.tfa.getDao('treasure-hunt.player-progression')
        const progression = await progressionCollection.findOne!(action, {player: player._id, storyPart: storyPart._id})
        if (!progression) {
            throw new AppError('not-found', 404, {entity: 'treasure-hunt.player-progression'})
        }
        
        let challenge = null
        if (storyPart.challenge) {
            challenge = {...await this.tfa.getDao('treasure-hunt.challenge').findOne!(action, storyPart.challenge)}
            delete challenge.checkSum
            delete challenge.onError
        }

        const trophies = this.tfa.getDao('treasure-hunt.trophy')

        
        return {
            status: progression.status,
            timeout: progression.timeout,
            challenge,
            data: progression.data,
            storyPart,
            trophies: (await trophies.list!(action, {player})).items,
        }
    }
    
    // OMG, spaghetti
    async checkChallengeAnswer(action: ActionContext, player: any, partId: string, answer: any) {
        const storyParts = this.tfa.getDao('treasure-hunt.story-part')
        const storyPart = await storyParts.findOne!(action, {slug: partId})
        if (!storyPart) {
            throw Object.assign(new Error('not-found'), {details: {target: 'story-part'}})
        }
        if (!storyPart.challenge) {
            throw Object.assign(new Error('no-challenge'), {status: 403})
        }
        
        const progressionCollection = this.tfa.getDao('treasure-hunt.player-progression')
        const progressionQuery = {player: player._id, storyPart: storyPart._id}
        const progression = await progressionCollection.findOne!(action, progressionQuery)
        if (!progression) {
            throw Object.assign(new Error('not-found'), {details: {target: 'player-progression'}})
        }
        const timeout = progression.timeout
        if (timeout && timeout.until > action.moment) {
            return { status: 'timeout', timeout }
        }
        
        const challenge: any = await this.tfa.getDao('treasure-hunt.challenge').findOne!(action, storyPart.challenge)
        if (!challenge || !challenge.checkSum) {
            throw Object.assign(new Error('no-check-available'), {status: 409})
        }
        
        if (answer.checkSum !== challenge.checkSum) {
            const errResult: any = {
                status: 'ko',
                errorActions: challenge.onError,
            }

            const timeoutAction = challenge.onError.find((errAction: any) => errAction[0] === 'timeout')
            if (timeoutAction) {
                const until = new Date(action.moment)
                const durationSeconds = timeoutAction[1]
                until.setSeconds(until.getSeconds() + durationSeconds)
                const timeout = { since: action.moment, until }
                await progressionCollection.update!(action, progressionQuery, {timeout})
                errResult.timeout = timeout
            }
            
            return errResult
        }
        
        if (progression.status === 'done') {
            throw Object.assign(new Error('already-solved'), {status: 409})
        }
        
        await progressionCollection.update!(action, progressionQuery, {status: 'done'})
        
        const checkResult: any = {
            status: 'ok',
        }
        
        const order = storyPart.order + 1
        const nextStoryPart = await storyParts.findOne!(action, {story: player.story, order})
        if (nextStoryPart) {
            await progressionCollection.create!(action, {
                player: player._id,
                storyPart: nextStoryPart._id,
                status: 'new',
                data: null,
            })
            checkResult.progression = await this.getProgressionData(action, player)

            const count = await storyParts.count!(action, {story: player.story})
            if (order === count) {
                const trophies = this.tfa.getDao('treasure-hunt.trophy')
                const trophy = {
                    player: player._id,
                    story: player.story,
                    order: await trophies.count!(action, {story: player.story}) + 1
                }

                await trophies.create!(action, trophy)

                checkResult.trophy = trophy
            }
        }
        
        return checkResult
    }
}
