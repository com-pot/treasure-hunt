import { describe, it, expect } from "vitest";
import dummyItemModelEntry from "../test/dummyItemModelEntry";
import { Dao } from "./dao/Daos";
import DaoFactory from "./DaoFactory";
import { EntityConfigEntry } from "./EntityRegistry";

type DummyDao = {
    type: 'dummy',
    config: EntityConfigEntry,
}

describe('DaoFactory', function() {

    const daoFactory = new DaoFactory()
    daoFactory.registerCreateFn('dummy', (config) => {
        return {
            type: 'dummy',
            config,
        } as unknown as Dao
    })

    it('should create registered type dao', function() {
        const dao = daoFactory.createDao({
            ...dummyItemModelEntry,
            persistence: 'dummy',
        }) as unknown as DummyDao

        expect((dao).config.meta.entityFqn).to.equal('dummy.item')
    })

    it('should throw unregistered type dao', function() {
        expect(() => daoFactory.createDao({...dummyItemModelEntry, persistence: 'random'})).to.throw(Error)
    })
})
