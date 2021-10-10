import AppError from "../../../app/AppError"
import { ActionContext } from "../../../app/middleware/actionContext"
import TypefulAccessor from "../../typeful/services/TypefulAccessor"
import { EntityInstance } from "../../typeful/typeful"
import ModelService from "../../typeful/services/ModelService"

type PlayerEntity = EntityInstance|any

export const create = (tfa: TypefulAccessor, model: string) => {
    return {
        ...ModelService.create<PlayerEntity>(tfa, model),
        
        async createPlayer(action: ActionContext, login: string, story: string) {
            let player = await this.dao.findOne!(action, {login, story})
            if (player) {
                throw new AppError('player-already-exists', 409)
            }
            
            player = await this.dao.create!(action, {
                user: login, story,
            })
            
            return player
        },
        
        async addCurrentChallenge(action: ActionContext, players: Record<string, PlayerEntity>) {
            const progressionCollection = tfa.getDao('treasure-hunt.player-progression')
            
            const progressions = await progressionCollection.aggregate!(action, [
                { type: 'group', by: 'player', add: {currentChallenge: {op: 'count'}} },
            ])
            
            
            progressions.forEach((prog) => {
                const player = players[prog._id.toString()]
                if (!player) {
                    console.warn("No player for progression " + prog._id)
                    return
                }
                player.currentChallenge = prog.currentChallenge
            })
        },
        
        async addTrophies(action: ActionContext, players: Record<string, PlayerEntity>) {
            const trophiesCollection = tfa.getDao('treasure-hunt.trophy')
            const playerIds = Object.values(players).map((p) => p._id)
            
            const trophies = await trophiesCollection.aggregate!(action, [
                {type: 'match', match: [{player: playerIds}]}
            ])
            
            trophies.forEach((trophy) => {
                const player = players[trophy.player]
                if (!player) {
                    console.warn("No player for trophy", trophy._id);
                    return
                }
                player.trophy = trophy
            })
        }
    }
}

export type PlayerService = ReturnType<typeof create>
