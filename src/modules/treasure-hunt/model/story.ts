import { EntityInstance, EntityRef } from "../../typeful/typeful"

export default {
    type: 'object',
    properties: {
        key: {type: 'string'},
        title: {type: 'string'},
        authors: {
            type: 'array',
            items: {
                type: 'relation',
                target: 'directory.person',
            },
        },
    },
}

export type StoryEntity = EntityInstance & {
    title: string,
    authors: EntityRef[],
}
