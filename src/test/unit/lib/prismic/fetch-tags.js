/* eslint-env mocha */
const chai = require('chai')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

const expect = chai.expect

chai.use(sinonChai)

const queryStub = sinon.stub().returns({
  results: [
    {
      tags: ['remember', 'that']
    },
    {
      tags: ['anything']
    },
    {
      tags: ['that', 'anything', 'is', 'remember']
    },
    {
      tags: ['possible', 'when', 'that']
    },
    {
      tags: ['you', 'possible', 'try']
    }
  ]
})
const apiStub = sinon.stub().returns(Promise.resolve({ query: queryStub }))

describe('fetchTags', () => {
  let fetchTags
  let cachedPrismicAccessToken

  beforeEach(() => {
    cachedPrismicAccessToken = process.env.PRISMICIO_WEB_ACCESS_TOKEN
    process.env.PRISMICIO_WEB_ACCESS_TOKEN = 'TEST_PRISMIC_ACCESS_TOKEN'
    fetchTags = proxyquire('../../../../gql/lib/prismic/fetch-tags', {
      'prismic.io': {
        api: apiStub
      }
    })
  })

  afterEach(() => {
    process.env.PRISMICIO_WEB_ACCESS_TOKEN = cachedPrismicAccessToken
    apiStub.reset()
    queryStub.reset()
  })

  it('initiates Prismic api with correct data', async () => {
    const accessToken = 'TEST_PRISMIC_ACCESS_TOKEN'
    await fetchTags()

    expect(apiStub).to.have.been.calledWith(
      `https://nudj-web.prismic.io/api`,
      { accessToken }
    )
  })

  it('calls the Prismic `query` method', async () => {
    await fetchTags()

    expect(queryStub).to.have.been.called()
  })

  it('returns a unique list of document tags', async () => {
    const result = await fetchTags()

    expect(result).to.deep.equal([
      'remember',
      'that',
      'anything',
      'is',
      'possible',
      'when',
      'you',
      'try'
    ])
  })
})
