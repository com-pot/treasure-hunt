import testUtils from "../../utils/testUtils.js";

describe('treasure hunt - story', function () {
    const api = testUtils.useApi()

    it('retrieves list of story parts', async function () {
        const result = await api.json.get('/backstage/treasure-hunt/story-parts')
        expect(result.length > 0).to.equal(true, 'retrieved story parts should be non-empty')
    })
});
