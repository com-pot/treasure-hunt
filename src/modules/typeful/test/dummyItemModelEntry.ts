import { EntityConfigEntry } from "../services/EntityRegistry";

const dummyItemModelEntry: EntityConfigEntry = {
    _plugins: {},
    schema: {
        type: 'object', properties: {},
    },
    primaryKey: 'id',
    persistence: 'dummy',
    meta: {
        entityFqn: 'dummy.item',
        name: 'item',
        module: 'dummy',
        collections: {
            default: {id: 'dummy.items'},
        },
    },
    endpoints: {
        collection: 'dummies',
        entityAny: 'dummy',
        entityExact: 'dummy/:id',
    },
}

export default dummyItemModelEntry
