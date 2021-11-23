import AppError from "../../../app/AppError"
import { ActionContext } from "../../../app/middleware/actionContext"
import TypefulAccessor from "../../typeful/services/TypefulAccessor"
import ModelService from "../../typeful/services/ModelService"
import { PlayerEntity } from "./player"
import { ObjectId } from "mongodb"
import { EntityInstance } from "../../typeful/typeful"

type WithCurrentChallenge = {currentChallenge: number}
type WithTrophy = {trophy: EntityInstance|null}

export const create = (tfa: TypefulAccessor, model: string) => {
    return {
        ...ModelService.create<PlayerEntity>(tfa, model),

        async createPlayer(action: ActionContext, login: string, story: string) {
            let player = await this.dao.findOne(action, {login, story})
            if (player) {
                throw new AppError('player-already-exists', 409)
            }

            player = await this.dao.create(action, {
                user: login, story,
            })

            return player
        },

        async withCurrentChallenge<T extends PlayerEntity>(action: ActionContext, players: T[]): Promise<(T & WithCurrentChallenge)[]> {
            const progressionCollection = tfa.getDao('treasure-hunt.player-progression')

            const progressions = await progressionCollection.aggregate<{_id: ObjectId, currentChallenge: number}>(action, [
                { type: 'group', by: 'player', add: {currentChallenge: {op: 'count'}} },
            ])
            const progressionsIndex = Object.fromEntries(progressions.map((prog) => {
                return [prog._id.toString(), prog]
            }))

            return players.map((player) => {
                const prog = progressionsIndex[player._id.toString()]
                const withCC = {...player, currentChallenge: prog?.currentChallenge ?? 0}

                return withCC
            })
        },

        async withTrophies<T extends PlayerEntity>(action: ActionContext, players: T[]): Promise<(T & WithTrophy)[]> {
            const trophiesCollection = tfa.getDao('treasure-hunt.trophy')
            const playerIds = Object.values(players).map((p) => p._id)

            const trophies = await trophiesCollection.aggregate<{player: ObjectId}>(action, [
                {type: 'match', match: [{player: playerIds}]}
            ])
            const trophyiesByPlayer = Object.fromEntries(trophies.map((trophy) => {
                return [trophy.player, trophy]
            }))

            return players.map((p) => {
                const trophy = trophyiesByPlayer[p._id.toString()] ?? null
                return {...p, trophy}
            })
        }
    }
}

export type PlayerService = ReturnType<typeof create>
