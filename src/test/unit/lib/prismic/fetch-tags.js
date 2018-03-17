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
const PRISMIC_API_STUB = 'PRISMIC_API_STUB'
const fetcherStub = sinon.stub().returns(PRISMIC_API_STUB)
const loggerStub = sinon.stub()

describe('Prismic.fetchTags', () => {
  let fetchTags
  let cachedPrismicAccessToken

  beforeEach(() => {
    cachedPrismicAccessToken = process.env.PRISMICIO_ACCESS_TOKEN
    process.env.PRISMICIO_ACCESS_TOKEN = 'TEST_PRISMIC_ACCESS_TOKEN'
    fetchTags = proxyquire('../../../../gql/lib/prismic/fetch-tags', {
      './fetch-api-for-repo': fetcherStub,
      './query-documents': queryStub,
      '@nudj/library': {
        logger: loggerStub
      }
    })
  })

  afterEach(() => {
    process.env.PRISMICIO_ACCESS_TOKEN = cachedPrismicAccessToken
    queryStub.reset()
    loggerStub.reset()
    fetcherStub.reset()
  })

  it('initiates Prismic api for correct repo', async () => {
    await fetchTags({ repo: 'platt', type: 'david' })

    expect(fetcherStub).to.have.been.calledWith('platt')
  })

  it('querys documents with the provided type and api', async () => {
    await fetchTags({ repo: 'platt', type: 'david' })

    expect(queryStub).to.have.been.calledWith({ api: PRISMIC_API_STUB, type: 'david' })
  })

  it('returns a unique list of document tags', async () => {
    const result = await fetchTags({ repo: 'platt', type: 'david' })

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

  it('returns null if an error occurs', async () => {
    fetcherStub.throws()
    const result = await fetchTags({ repo: 'platt', type: 'david' })

    expect(loggerStub).to.have.been.calledWith('error')
    expect(result).to.equal(null)
  })
})
