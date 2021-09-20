import storyModel from './model/story.js'
import storyPartModel from './model/story-part.js'
import challengeTypeModel from './model/challenge-type.js'
import challengeTypeSotwData from './data/challenge-type.js'

export const entities = {
    story: {
        model: storyModel,
        plural: 'stories',
    },
    'story-part': {
        model: storyPartModel,
        strategy: {
            type: 'dao',
            primaryKey: 'storyPartId',
        },
    },
    'challenge-type': {
        model: challengeTypeModel,
        strategy: {
            type: 'static',
            items: challengeTypeSotwData,
            primaryKey: 'type',
        },
    }
}
