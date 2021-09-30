import mongodb from "mongodb";

export default class DashboardController {
    
    constructor(mongoClient) {
        /** @type {mongodb.MongoClient} */
        this.mongoClient = mongoClient
    }
    
    async getPlayersDashboard(actionContext) {
        const playersCollection = this.mongoClient.db().collection('treasure-hunt.player')
        const progressionCollection = this.mongoClient.db().collection('treasure-hunt.player-progression')
        const trophiesCollection = this.mongoClient.db().collection('treasure-hunt.trophy')
        
        const players = await playersCollection.find().limit(200).toArray()
        const playerIds = players.map((p) => p._id)
        
        const playersIndex = Object.fromEntries(players.map((p) => [p._id.toString(), p]))
        
        const progressions = await progressionCollection.aggregate([
            {$group: {_id: '$player', currentChallenge: {$count: {}}}}
        ]).toArray()
        
        progressions.forEach((prog) => {
            const player = playersIndex[prog._id.toString()]
            if (!player) {
                console.warn("No player for progression " + prog._id)
                return
            }
            player.currentChallenge = prog.currentChallenge
        })

        const trophies = await trophiesCollection.find({player: {$in: playerIds}}).toArray()
        trophies.forEach((trophy) => {
            const player = playersIndex[trophy.player]
            if (!player) {
                console.warn("No player for trophy", trophy._id);
                return
            }
            player.trophy = trophy
        })
        
        return {
            players,
        }
    }

    async redeemTrophy(actionContext, login) {
        const playersCollection = this.mongoClient.db().collection('treasure-hunt.player')
        const trophiesCollection = this.mongoClient.db().collection('treasure-hunt.trophy')

        const player = await playersCollection.findOne({login})
        if (!player) {
            throw Object.assingn(new Error('not-found'), {details: "player-not-found"})
        }
        const trophy = await trophiesCollection.findOne({player: player._id})
        if (!trophy) {
            throw Object.assingn(new Error('not-found'), {details: "trophy-not-found"})
        }
        if (trophy.redeemedAt) {
            throw Object.assingn(new Error('already-redeemed'), {status: 409})
        }
        await trophiesCollection.updateOne({player: player._id}, {$set: {redeemedAt: actionContext.moment}})

        return await trophiesCollection.findOne({player: player._id})
    }
    
    async getStoryDashboard(actionContext, story) {
        const storyPartsCollection = this.mongoClient.db().collection('treasure-hunt.story-part')
        const progressionCollection = this.mongoClient.db().collection('treasure-hunt.player-progression')
        
        const storyParts = await storyPartsCollection.find({story}).sort({order: 1}).toArray()
        const storyPartIds = storyParts.map((sp) => sp._id)
        
        const storyPartIndex = Object.fromEntries(storyParts.map((sp) => [sp._id.toString(), sp]))
        
        const progAggr = await progressionCollection.aggregate([
            {$match: {storyPart: {$in: storyPartIds}}},
            {$group: {_id: {storyPart: '$storyPart', status: '$status'}, count: {$count: {}}}},
        ]).toArray()
        
        
        storyParts.forEach((sp) => sp.countByStatus = {})
        progAggr.forEach((prog) => {
            const {status, storyPart} = prog._id
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
