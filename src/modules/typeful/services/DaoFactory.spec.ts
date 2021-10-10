import { expect } from "chai";
import { describe } from "mocha";
import dummyItemModelEntry from "../test/dummyItemModelEntry";
import { Dao } from "./dao/Daos";
import DaoFactory from "./DaoFactory";
import { EntityConfigEntry } from "./EntityRegistry";

describe('DaoFactory', function() {

    const daoFactory = new DaoFactory()
    daoFactory.registerCreateFn('dummy', (config) => {
        return {
            type: 'dummy',
            config,
        } as Dao
    })

    it('should create registered type dao', function() {
        const dao = daoFactory.createDao({
            ...dummyItemModelEntry,
            strategy: {type: 'dummy'},
        })

        expect((dao as any).config.meta.entityFqn).to.equal('dummy.item')
    })

    it('should throw unregistered type dao', function() {
        expect(() => daoFactory.createDao({...dummyItemModelEntry, strategy: {type: 'random'}})).to.throw(Error)
    })
})
