import mongodb from "mongodb"

export default {
    /** @type {mongodb.MongoClient} */
    mongoClient: null,

    async createPlayer(login, story) {
        const players = this.mongoClient.db().collection('treasure-hunt.player')

        let player = await players.findOne({login, story})
        if (player) {
            throw Object.assign(new Error('player-already-exists'), {status: 409})
        }

        player = await players.insertOne({
            login, story,
        })

        return player
    },
}
