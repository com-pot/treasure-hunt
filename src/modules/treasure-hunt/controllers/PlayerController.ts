import AppError from "../../../app/AppError"
import { ActionContext } from "../../../app/middleware/actionContext"
import TypefulAccessor from "../../typeful/services/TypefulAccessor"
import { ChallengeEntity } from "../model/challenge"
import { ClueService } from "../model/clue.service"
import { PlayerEntity } from "../model/player"
import { PlayerProgressionEntity } from "../model/player-progression"
import { PlayerProgressionService } from "../model/player-progression.service"
import { StoryPartEntity } from "../model/story-part"
import { AnswerAttempt, StoryPartService } from "../model/story-part.service"
import { TreasureHuntContentService } from "../model/_content.service"


export default class PlayerController {
    constructor(private readonly tfa: TypefulAccessor) {

    }

    async getProgressionData(actionContext: ActionContext, player: PlayerEntity) {
        const progressionModel = this.tfa.getModel<PlayerProgressionService>('treasure-hunt.player-progression')
        const storyPartsCollection = this.tfa.getDao<StoryPartEntity>('treasure-hunt.story-part')

        const progression = await progressionModel.getProgression(actionContext, player)

        const storyPartIds = progression.map((p) => p.storyPart)
        const storyParts = (await storyPartsCollection.list(actionContext, {_id: storyPartIds}, undefined, {page: 1, perPage: 1000})).items

        return storyParts.map((sp) => {
            const progressItem = progression.find((p) => sp._id.equals(p.storyPart))

            return {
                _id: sp._id,
                title: sp.title,
                slug: sp.slug,
                challenge: sp.challenge,

                status: progressItem?.status,
                progressData: progressItem?.data,
                timeout: progressItem?.timeout,
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
            challenge = await this.tfa.getDao<ChallengeEntity>('treasure-hunt.challenge').findOne(action, storyPart.challenge)
            if (challenge) {
                challenge = {...challenge}
                delete challenge.checkSum
                delete challenge.onError
            }
        }

        if (storyPart.thContentBlocks) {
            const contentService = this.tfa.getModel<TreasureHuntContentService>('treasure-hunt._content')
            storyPart.thContentBlocks = await contentService.filterVisibleBlocks({...action, player}, storyPart.thContentBlocks || [])
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

    async checkChallengeAnswer(action: ActionContext, player: PlayerEntity, partId: string, answer: AnswerAttempt) {
        const storyPartsService = this.tfa.getModel<StoryPartService>('treasure-hunt.story-part')

        const storyPart = await storyPartsService.dao.findOne(action, {slug: partId})
        if (!storyPart) {
            throw new AppError('not-found', 404, {target: 'story-part', reason: 'query'})
        }

        const checkResult = await storyPartsService.checkAnswer(action, player, storyPart, answer)

        const resultWithProgression: typeof checkResult & {progression?: any[]} = checkResult
        resultWithProgression.progression = await this.getProgressionData(action, player)

        return resultWithProgression
    }

    async revealClue(action: ActionContext, player: PlayerEntity, clueKey: string) {
        const clueService = this.tfa.getModel<ClueService>('treasure-hunt.clue')

        const clue = await clueService.dao.findOne(action, clueKey)
        if (!clue) {
            throw new AppError('not-found', 404, {clue: clueKey})
        }

        const revealedClue = await clueService.revealClue(action, clue)
        return clueService.preparePlayerClue(action, player, revealedClue)
    }
}
