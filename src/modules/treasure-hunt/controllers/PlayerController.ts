import AppError from "../../../app/AppError"
import { ActionContext } from "../../../app/middleware/actionContext"
import TypefulAccessor from "../../typeful/services/TypefulAccessor"
import { ChallengeEntity } from "../model/challenge"
import { PlayerEntity } from "../model/player"
import { PlayerProgressionEntity } from "../model/player-progression"
import { PlayerProgressionService } from "../model/player-progression.service"
import { StoryPartEntity } from "../model/story-part"
import { TrophyEntity } from "../model/trophy"

type ProgressionData = {
    title: string,
    slug: string,
    challenge: StoryPartEntity['challenge'],
    status: string|undefined,
}
type OkResult = {
    status: 'ok',
    progression?: ProgressionData[],
    trophy?: TrophyEntity,
}
type ErrResult = {
    status: 'ko',
    errorActions: ChallengeEntity['onError'],
    timeout?: PlayerProgressionEntity['timeout'],
}

export default class PlayerController {
    constructor(private readonly tfa: TypefulAccessor) {

    }

    async getProgressionData(actionContext: ActionContext, player: PlayerEntity) {
        const progressionModel = this.tfa.getModel<PlayerProgressionService>('treasure-hunt.player-progression')
        const storyPartsCollection = this.tfa.getDao<StoryPartEntity>('treasure-hunt.story-part')

        const progression = await progressionModel.getProgression(actionContext, player)

        const storyPartIds = progression.map((p) => p.storyPart)
        const storyParts = (await storyPartsCollection.list(actionContext, {_id: storyPartIds})).items

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

    async getStoryPart(action: ActionContext, player: PlayerEntity, partId: string) {
        const storyPartsCollection = this.tfa.getDao<StoryPartEntity>('treasure-hunt.story-part')
        const storyPart = await storyPartsCollection.findOne(action, {slug: partId})
        if (!storyPart) {
            throw new AppError('not-found', 404, {entity: 'treasure-hunt.story-part'})
        }

        const progressionCollection = this.tfa.getDao<PlayerProgressionEntity>('treasure-hunt.player-progression')
        const progression = await progressionCollection.findOne(action, {player: player._id, storyPart: storyPart._id})
        if (!progression) {
            throw new AppError('not-found', 404, {entity: 'treasure-hunt.player-progression'})
        }

        let challenge: ChallengeEntity|null = null
        if (storyPart.challenge) {
            challenge = {...await this.tfa.getDao<ChallengeEntity>('treasure-hunt.challenge').findOne(action, storyPart.challenge)}

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
            trophies: (await trophies.list(action, {player})).items,
        }
    }

    // OMG, spaghetti
    async checkChallengeAnswer(action: ActionContext, player: PlayerEntity, partId: string, answer: {checkSum: string}) {
        const storyPartsCollection = this.tfa.getDao<StoryPartEntity>('treasure-hunt.story-part')
        const storyPart = await storyPartsCollection.findOne(action, {slug: partId})
        if (!storyPart) {
            throw new AppError('not-found', 404, {target: 'story-part'})
        }
        if (!storyPart.challenge) {
            throw new AppError('no-challenge', 403)
        }

        const progressionCollection = this.tfa.getDao<PlayerProgressionEntity>('treasure-hunt.player-progression')
        const progressionQuery = {player: player._id, storyPart: storyPart._id}
        const progression = await progressionCollection.findOne(action, progressionQuery)
        if (!progression) {
            throw Object.assign(new Error('not-found'), {details: {target: 'player-progression'}})
        }
        const timeout = progression.timeout
        if (timeout && timeout.until > action.moment) {
            return { status: 'timeout', timeout }
        }

        const challenge = await this.tfa.getDao<ChallengeEntity>('treasure-hunt.challenge').findOne(action, storyPart.challenge)
        if (!challenge || !challenge.checkSum) {
            throw Object.assign(new Error('no-check-available'), {status: 409})
        }

        if (answer.checkSum !== challenge.checkSum) {
            const errResult: ErrResult = {
                status: 'ko',
                errorActions: challenge.onError,
            }

            const timeoutAction = challenge.onError?.find((errAction) => errAction[0] === 'timeout')
            if (timeoutAction) {
                const until = new Date(action.moment)
                const durationSeconds = timeoutAction[1] as number
                until.setSeconds(until.getSeconds() + durationSeconds)
                const timeout = { since: action.moment, until }
                await progressionCollection.update(action, progressionQuery, {timeout})
                errResult.timeout = timeout
            }

            return errResult
        }

        if (progression.status === 'done') {
            throw Object.assign(new Error('already-solved'), {status: 409})
        }

        await progressionCollection.update(action, progressionQuery, {status: 'done'})

        const checkResult: OkResult = {
            status: 'ok',
        }

        const order = storyPart.order + 1
        const nextStoryPart = await storyPartsCollection.findOne(action, {story: player.story, order})
        if (nextStoryPart) {
            await progressionCollection.create(action, {
                player: player._id,
                storyPart: nextStoryPart._id,
                status: 'new',
                data: null,
            })
            checkResult.progression = await this.getProgressionData(action, player)

            const count = await storyPartsCollection.count(action, {story: player.story})
            if (order === count) {
                const trophies = this.tfa.getDao<TrophyEntity>('treasure-hunt.trophy')

                const trophy = await trophies.create(action, {
                    player: player._id,
                    story: player.story,
                    order: await trophies.count(action, {story: player.story}) + 1
                })

                checkResult.trophy = trophy
            }
        }

        return checkResult
    }
}
