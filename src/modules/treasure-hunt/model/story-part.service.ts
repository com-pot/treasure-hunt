import { isNil } from "lodash";
import { ObjectId } from "mongodb";
import AppError from "../../../app/AppError";
import { ActionContext } from "../../../app/middleware/actionContext";
import { ActionModelService } from "../../typeful-executive/model/action.service";
import ModelService from "../../typeful/services/ModelService";
import TypefulAccessor from "../../typeful/services/TypefulAccessor";
import { CompleteStoryPartResult } from "../executive/actions/completeStoryPart";
import { ChallengeEntity } from "./challenge";
import { vlmAnswerEvaluationControllers } from "./custom/vlm.story-part";
import { PlayerEntity } from "./player";
import { PlayerProgressionEntity } from "./player-progression";
import { StoryPartEntity } from "./story-part";
import { TrophyEntity } from "./trophy";
import { TreasureHuntContentService } from "./_content.service";

export const create = (tfa: TypefulAccessor, fqn: string) => {
    return {
        ...ModelService.create<StoryPartEntity>(tfa, fqn),

        // Lots of this is here from PlayerController. Progression-related stuff actually should be moved to
        //  some kind of transactional business service
        async checkAnswer(action: ActionContext, player: PlayerEntity, storyPart: StoryPartEntity, answer: AnswerAttempt): Promise<AnswerEvaluationResult> {
            const progressionCollection = tfa.getDao<PlayerProgressionEntity>('treasure-hunt.player-progression')
            const progressionQuery = {player: player._id, storyPart: storyPart._id}
            const progression = await progressionCollection.findOne(action, progressionQuery)
            if (!progression) {
                throw new AppError('not-found', 404, {target: 'story-part', reason: 'player-state'})
            }
            const timeout = progression.timeout
            if (timeout && timeout.until > action.moment) {
                return { status: 'ko' }
            }


            let checkResult: AnswerEvaluationResult
            if (storyPart.contentController === 'th-blocks') {
                checkResult = await this._checkAnswerBlocks(action, player, storyPart, answer)
            } else {
                checkResult = await this._checkAnswerChallenge(action, storyPart, answer)
            }

            console.log({checkResult});


            const timeoutAction = checkResult.evaluationEffects?.find((errAction) =>  errAction.type === 'timeout')
            const updateProgression: Partial<typeof progression> = {}
            if (timeoutAction) {
                const until = new Date(action.moment)
                const durationSeconds = timeoutAction.arguments.duration as number
                until.setSeconds(until.getSeconds() + durationSeconds)
                checkResult.evaluationEffects

                updateProgression.timeout = { since: action.moment, until }
            }

            let updateData = checkResult.evaluationEffects?.find((effect) => effect.type === 'updateProgressionData')
            if (!updateData) {
                updateData = {type: 'updateProgressionData', arguments: {data: {answer: answer.value}}}
            }
            if (updateData) {
                if (answer.block) {
                    updateProgression.data = progression.data || {}
                    updateProgression.data[answer.block] = updateData.arguments.data
                } else {
                    updateProgression.data = updateData.arguments.data as {}
                }
            }

            console.log(updateProgression);


            if (Object.keys(updateProgression).length) {
                await progressionCollection.update(action, progressionQuery, updateProgression)
            }

            if (checkResult.status === 'ko') {
                return checkResult
            }

            if (progression.status === 'done') {
                checkResult.freshness = 'stale'
            } else {
                await progressionCollection.update(action, progressionQuery, {status: 'done'})
                checkResult.freshness = 'fresh'
            }

            if (checkResult.status === 'ok') {
                const actionService = tfa.getModel<ActionModelService>('typeful-executive.action')

                const result = await actionService.executeAction<CompleteStoryPartResult>(action, {
                    type: 'treasure-hunt.completeStoryPart',
                    arguments: {
                        slug: storyPart.slug,
                    },
                }, (err, details) => console.error(err, details))
                checkResult.trophy = result.trophy
            }

            return checkResult
        },

        async _checkAnswerChallenge(action: ActionContext, storyPart: StoryPartEntity, answer: AnswerAttempt) {
            if (!storyPart.challenge) {
                throw new AppError('no-challenge', 403)
            }
            const challenge = await tfa.getDao<ChallengeEntity>('treasure-hunt.challenge').findOne(action, storyPart.challenge)
            return evaluateChallengeAnswer(answer, challenge)
        },
        async _checkAnswerBlocks(action: ActionContext, player: PlayerEntity, storyPart: StoryPartEntity, answer: AnswerAttempt) {
            const contentService = tfa.getModel<TreasureHuntContentService>('treasure-hunt._content')
            const blocks = await contentService.filterVisibleBlocks({...action, player}, storyPart.thContentBlocks || [])

            let blockId = answer.block
            if (isNil(blockId)) {
                blockId = blocks.findIndex((block) => block.type === 'challenge')
            }
            const block = typeof blockId === 'number' ? blocks[blockId] : blocks.find((block) => block.id === blockId)
            if (!block) {
                throw new AppError('not-found', 404, {target: 'content-block', block: blockId})
            }

            return evaluateChallengeAnswer(answer, block.config as ChallengeEntity)
        },
    }
}

export type AnswerEvaluationController = (answer: AnswerAttempt, challenge: ChallengeEntity) => AnswerEvaluationResult
const evaluationControllers: Record<string, AnswerEvaluationController> = {
    default: (answer, challenge) => {
        if (!challenge.checkSum) {
            throw new AppError('no-check-available', 409, {reason: 'no-checksum'})
        }

        if (answer.value !== challenge.checkSum) {
            return {
                status: 'ko',
                evaluationEffects: challenge.onError,
            }
        }

        return {status: 'ok'}
    },
    ...vlmAnswerEvaluationControllers,
}
function evaluateChallengeAnswer(answer: AnswerAttempt, challenge?: ChallengeEntity|null): AnswerEvaluationResult {
    if (!challenge) {
        throw new AppError('no-check-available', 409, {reason: 'no-challenge'})
    }

    const ctrl = challenge.customController ? evaluationControllers[challenge.customController] : evaluationControllers.default
    if (!ctrl) {
        throw new AppError('no-check-available', 409, {reason: 'no-evaluation-controller', spec: challenge.customController})
    }

    return ctrl(answer, challenge)
}


export type StoryPartService = ReturnType<typeof create>

export type AnswerAttempt = {
    value: string,
    block?: string|number,
}

type AnswerEvaluationResult = {
    status: 'ok' | 'ko' | 'custom',
    freshness?: 'fresh' | 'stale',

    evaluationEffects?: ChallengeEntity['onError'],
    trophy?: TrophyEntity,
}
