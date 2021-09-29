import mongodb from "mongodb";

export default class DashboardController {
    
    constructor(mongoClient) {
        /** @type {mongodb.MongoClient} */
        this.mongoClient = mongoClient
    }
    
    async getPlayersDashboard(actionContext) {
        const playersCollection = this.mongoClient.db().collection('treasure-hunt.player')
        const progressionCollection = this.mongoClient.db().collection('treasure-hunt.player-progression')
        
        const players = await playersCollection.find().limit(200).toArray()
        
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
        
        return {
            players,
        }
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
