import { ActionContext } from "../../../app/middleware/actionContext";
import AppError from "../../../app/AppError";
import TypefulAccessor from "../../typeful/services/TypefulAccessor";
import {PlayerService} from "../model/player.service";

export default class DashboardController {
    
    constructor(private readonly tfa: TypefulAccessor) {
        
    }
    
    async getPlayersDashboard(actionContext: ActionContext) {
        const playerService = this.tfa.getModel<PlayerService>('treasure-hunt.player')
        
        const players = await playerService.dao.list!(actionContext, undefined, undefined, {page: 1, perPage: 200})
        const playersIndex = Object.fromEntries(players.items.map((p) => [p._id.toString(), p]))

        await playerService.addCurrentChallenge(actionContext, playersIndex)
        await playerService.addTrophies(actionContext, playersIndex)
        
        return {
            players,
        }
    }

    async redeemTrophy(actionContext: ActionContext, user: string) {
        const playersCollection = this.tfa.getDao('treasure-hunt.player')
        const trophiesCollection = this.tfa.getDao('treasure-hunt.trophy')

        const player = await playersCollection.findOne!(actionContext, {user})
        if (!player) {
            throw new AppError('not-found', 404, "player-not-found")
        }
        const trophy = await trophiesCollection.findOne!(actionContext, {player: player._id})
        if (!trophy) {
            throw new AppError('not-found', 404, {details: "trophy-not-found"})
        }
        if (trophy.redeemedAt) {
            throw new AppError('already-redeemed', 409)
        }
        await trophiesCollection.update!(actionContext, {player: player._id}, {redeemedAt: actionContext.moment})

        return await trophiesCollection.findOne!(actionContext, {player: player._id})
    }
    
    async getStoryDashboard(actionContext: ActionContext, story: string) {
        const storyPartsCollection = this.tfa.getDao('treasure-hunt.story-part')
        const progressionCollection = this.tfa.getDao('treasure-hunt.player-progression')
        
        const storyParts = (await storyPartsCollection.list!(actionContext, {story}, [['order']])).items
        const storyPartIds = storyParts.map((sp) => sp._id)
        const storyPartIndex = Object.fromEntries(storyParts.map((sp) => [sp._id.toString(), sp]))
        
        const progAggr = await progressionCollection.aggregate!(actionContext, [
            {type: 'match', match: [['storyPart', 'in', storyPartIds]]},
            {type: 'group', by: ['storyPart', 'status'], add: {count: {op: 'count'}}},
        ])
        
        storyParts.forEach((sp) => sp.countByStatus = {})
        progAggr.forEach((prog) => {
            const [storyPart, status] = prog._id
            const sp = storyPartIndex[storyPart]
            
            sp.countByStatus[status] = prog.count
        })
        storyParts.forEach((sp) => {
            if (!sp.countByStatus.new) {
                sp.countByStatus.new = 0
            }
            if (!sp.countByStatus.done) {
                sp.countByStatus.done = 0
            }
        })
        
        return {
            storyParts,
        }
    }
}
