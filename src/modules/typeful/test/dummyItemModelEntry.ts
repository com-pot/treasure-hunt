import { EntityConfigEntry } from "../services/EntityRegistry";

const dummyItemModelEntry: EntityConfigEntry = {
    _plugins: {},
    model: {},
    strategy: {type: 'dummy', primaryKey: 'id'},
    meta: {
        collectionFqn: 'dummy.items',
        entityFqn: 'dummy.item',
        name: 'item',
        collectionName: 'items',
        module: 'dummy',
    },
}

export default dummyItemModelEntry
