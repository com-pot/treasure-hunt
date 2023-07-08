import { EntityConfigEntry } from "../services/EntityRegistry";

const dummyItemModelEntry: EntityConfigEntry = {
    _plugins: {},
    schema: {
        type: 'object', properties: {},
    },
    primaryKey: 'id',
    persistence: 'dummy',
    meta: {
        collectionFqn: 'dummy.items',
        entityFqn: 'dummy.item',
        name: 'item',
        collectionName: 'items',
        module: 'dummy',
    },
    endpoints: {
        collection: 'dummies',
        entityAny: 'dummy',
        entityExact: 'dummy/:id',
    },
}

export default dummyItemModelEntry
