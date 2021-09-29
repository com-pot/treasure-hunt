import mongodb from "mongodb"

import sotwChallenges from "../data/challenge.js"

export default class PlayerController {
    constructor(mongoClient, model) {
        /** @type {mongodb.MongoClient} */
        this.mongoClient = mongoClient
        this.model = model
    }
    
    async getProgressionData(actionContext, player, story) {
        const progressionCollection = this.mongoClient.db().collection('treasure-hunt.player-progression')
        
        let progression = await progressionCollection.find({player: player._id}).toArray()
        
        if (!progression.length) {
            const firstStoryPart = await this.mongoClient.db().collection('treasure-hunt.story-part').findOne({story, order: 1})
            if (!firstStoryPart) {
                throw Object.assign(new Error("story-not-available"), {status: 503, details: {story, order: 1}})
            }
            
            await progressionCollection.insertOne({
                player: player._id,
                storyPart: firstStoryPart._id,
                status: 'new',
                challengeData: null,
            })
            
            progression = await progressionCollection.find({player: player._id}).toArray()
        }
        
        const storyPartIds = progression.map((p) => p.storyPart)
        const storyParts = await this.mongoClient.db().collection('treasure-hunt.story-part').find({_id: {$in: storyPartIds}}).toArray()
        
        return storyParts.map((sp) => {
            const progressItem = progression.find((p) => sp._id.equals(p.storyPart))
            
            return {
                title: sp.title,
                slug: sp.slug,
                challenge: sp.challenge,
                status: progressItem.status,
            }
        })
    }
    
    async getStoryPart(action, player, partId) {
        const storyParts = this.mongoClient.db().collection('treasure-hunt.story-part')
        const storyPart = await storyParts.findOne({slug: partId})
        if (!storyPart) {
            throw new Error('not-found')
        }
        
        const progressionCollection = this.mongoClient.db().collection('treasure-hunt.player-progression')
        const progression = await progressionCollection.findOne({player: player._id, storyPart: storyPart._id})
        if (!progression) {
            throw new Error('not-found')
        }
        
        let challenge = null
        if (storyPart.challenge) {
            challenge = {...sotwChallenges.collection.find((ch) => ch.id === storyPart.challenge)}
            delete challenge.checkSum
            delete challenge.onError
            if (typeof challenge.challengeConfig === "function") {
                challenge.challengeConfig = await challenge.challengeConfig()
            }
        }

        const trophies = this.mongoClient.db().collection('treasure-hunt.trophy')

        
        return {
            status: progression.status,
            timeout: progression.timeout,
            challenge,
            data: progression.data,
            storyPart,
            trophies: await trophies.find({player: player._id, story: player.story}).toArray(),
        }
    }
    
    // OMG, spaghetti
    async checkChallengeAnswer(action, player, partId, answer) {
        const storyParts = this.mongoClient.db().collection('treasure-hunt.story-part')
        const storyPart = await storyParts.findOne({slug: partId})
        if (!storyPart) {
            throw Object.assign(new Error('not-found'), {details: {target: 'story-part'}})
        }
        if (!storyPart.challenge) {
            throw Object.assign(new Error('no-challenge'), {status: 403})
        }
        
        const progressionCollection = this.mongoClient.db().collection('treasure-hunt.player-progression')
        const progressionQuery = {player: player._id, storyPart: storyPart._id}
        const progression = await progressionCollection.findOne(progressionQuery)
        if (!progression) {
            throw Object.assign(new Error('not-found'), {details: {target: 'player-progression'}})
        }
        const timeout = progression.timeout
        if (timeout && timeout.until > action.moment) {
            return { status: 'timeout', timeout }
        }
        
        const challenge = sotwChallenges.collection.find((ch) => ch.id === storyPart.challenge)
        if (!challenge.checkSum) {
            throw Object.assign(new Error('no-check-available'), {status: 409})
        }
        
        if (answer.checkSum !== challenge.checkSum) {
            const errResult = {
                status: 'ko',
                errorActions: challenge.onError,
            }

            const timeoutAction = challenge.onError.find(([type]) => type === 'timeout')
            if (timeoutAction) {
                const until = new Date(action.moment)
                const durationSeconds = timeoutAction[1]
                until.setSeconds(until.getSeconds() + durationSeconds)
                const timeout = { since: action.moment, until }
                await progressionCollection.updateOne(progressionQuery, {$set: {timeout}})
                errResult.timeout = timeout
            }
            
            return errResult
        }
        
        if (progression.status === 'done') {
            throw Object.assign(new Error('already-solved'), {status: 409})
        }
        
        await progressionCollection.updateOne(progressionQuery, {$set: {status: 'done'}})
        
        const checkResult = {
            status: 'ok',
        }
        
        const order = storyPart.order + 1
        const nextStoryPart = await storyParts.findOne({story: player.story, order})
        if (nextStoryPart) {
            await progressionCollection.insertOne({
                player: player._id,
                storyPart: nextStoryPart._id,
                status: 'new',
                data: null,
            })
            checkResult.progression = await this.getProgressionData(action, player, player.story)

            const count = await storyParts.count({story: player.story})
            if (order === count) {
                const trophies = this.mongoClient.db().collection('treasure-hunt.trophy')
                const trophy = {
                    player: player._id,
                    story: player.story,
                    order: await trophies.count({story: player.story}) + 1
                }

                await trophies.insertOne(trophy)

                checkResult.trophy = trophy
            }
        }
        
        return checkResult
    }
}
