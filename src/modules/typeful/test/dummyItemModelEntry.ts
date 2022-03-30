import { EntityConfigEntry } from "../services/EntityRegistry";

const dummyItemModelEntry: EntityConfigEntry = {
    _plugins: {},
    schema: {
        type: 'schema', fields: {},
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
