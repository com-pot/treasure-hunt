import testUtils from "../../utils/testUtils.js";

describe('Progression', function () {
  const api = testUtils.useApi()

  let testUser, playerApi

  this.beforeAll(async () => {
    testUser = await testUtils.useTestUser(api)
    playerApi = testUtils.useApi(testUser.token)
  })

  it("retrieves current players progression", async function () {
    const result = await playerApi.json.get('/treasure-hunt/progression')
    expect(result).to.have.length(1)
    expect(result[0].slug).to.equal('pochop')
  })

  it("retrieves story data", async function() {
    const result = await playerApi.json.get('/treasure-hunt/progression/pochop')
    expect(result.storyPart.challenge).to.equal('sotw.ch-1.understand')
  })

  it("checks answer - incorrect", async function() {
    const errResult = await playerApi.json.post('/treasure-hunt/progression/pochop/answer', {checkSum: '2'})
    expect(errResult.status).to.equal('ko')
    expect(errResult.errorActions).to.deep.equal([['message', "Ale né musíme to zkusit znova!"]])
  })

  it("checks answer - correct", async function() {
    const okResult = await playerApi.json.post('/treasure-hunt/progression/pochop/answer', {checkSum: '3'})
    expect(okResult.progression).to.be.an('array', 'result should contain progression list')
    expect(okResult.progression).to.have.lengthOf(2, 'progression should have 1 new item')
    expect(okResult.progression[1].slug).to.equal('pozdrav', 'new progression item should be "pozdrav"')
  })
})
