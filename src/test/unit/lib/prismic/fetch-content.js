/* eslint-env mocha */
const chai = require('chai')
const proxyquire = require('proxyquire')
const expect = chai.expect
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

chai.use(sinonChai)

const baseArgs = {
  type: 'testing',
  repo: 'special-test',
  tags: [ 'test' ],
  keys: {
    testMessage: 'document.testing'
  }
}

const queryResponse = {
  results: [
    {
      get: (value) => ({ value: 'Test Value!' }),
      tags: [ 'test', 'test-thing' ]
    },
    {
      get: (value) => ({
        blocks: [
          { text: 'Super' },
          { text: 'Test!' }
        ]
      }),
      tags: [ 'second-test', 'super-test' ]
    }
  ]
}

const queryDocumentsStub = sinon.stub().returns(queryResponse)
const prismicStub = sinon.stub().returns({ fake: true })

describe('fetchContent', () => {
  let fetchContent
  let cachedPrismicAccessToken

  beforeEach(() => {
    cachedPrismicAccessToken = process.env.PRISMICIO_ACCESS_TOKEN
    process.env.PRISMICIO_ACCESS_TOKEN = 'TEST_PRISMIC_ACCESS_TOKEN'
    fetchContent = proxyquire('../../../../gql/lib/prismic/fetch-content', {
      './query-documents': queryDocumentsStub,
      'prismic.io': {
        api: prismicStub
      }
    })
  })

  afterEach(() => {
    process.env.PRISMICIO_ACCESS_TOKEN = cachedPrismicAccessToken
    queryDocumentsStub.reset()
    prismicStub.reset()
  })

  it('calls Prismic api with repo url and access token', async () => {
    await fetchContent(baseArgs)
    expect(prismicStub).to.have.been.calledWith(
      `https://nudj-special-test.prismic.io/api`,
      { accessToken: 'TEST_PRISMIC_ACCESS_TOKEN' }
    )
  })

  it('queries Prismic api with formatted query', async () => {
    await fetchContent(baseArgs)
    expect(queryDocumentsStub).to.have.been.called()
  })

  it('fetches and returns formatted content', async () => {
    const content = await fetchContent(baseArgs)
    expect(content).to.deep.equal([
      {
        testMessage: 'Test Value!',
        tags: [
          'test',
          'test-thing'
        ]
      },
      {
        testMessage: 'Super\n\nTest!',
        tags: [
          'second-test',
          'super-test'
        ]
      }
    ])
  })

  it('returns null when it encounters an error', async () => {
    prismicStub.throws(new Error('Test Power: Over 9000'))
    expect(await fetchContent(baseArgs)).to.be.null()
  })
})
