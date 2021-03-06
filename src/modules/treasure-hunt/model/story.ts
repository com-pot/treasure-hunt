import { EntityInstance, EntityRef } from "../../typeful/typeful"

export default {
    type: 'schema',
    fields: {
        key: {type: 'string'},
        title: {type: 'string'},
        authors: {
            type: 'list',
            innerType: {
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
