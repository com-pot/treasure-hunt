import { EntityConfigEntry } from "../services/EntityRegistry";

const dummyItemModelEntry: EntityConfigEntry = {
    model: {
        
    },
    strategy: {primaryKey: 'id'},
    meta: {
        collectionFqn: 'dummy.items',
        entityFqn: 'dummy.item',
        name: 'item',
        collectionName: 'items',
        module: 'dummy',
    },
}

export default dummyItemModelEntry
