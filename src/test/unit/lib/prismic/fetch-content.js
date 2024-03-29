/* eslint-env mocha */
const chai = require('chai')
const proxyquire = require('proxyquire')
const expect = chai.expect
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

chai.use(sinonChai)

const baseArgs = {
  type: 'testing',
  repo: 'web',
  tags: [ 'test' ],
  keys: {
    testMessage: 'message'
  }
}

const queryResponse = {
  results: [
    {
      rawJSON: {
        testing: {
          message: {
            type: 'Text',
            value: 'Test Value!'
          }
        }
      },
      tags: [ 'test', 'test-thing' ]
    },
    {
      rawJSON: {
        testing: {
          message: {
            type: 'StructuredText',
            value: [
              {
                type: 'Paragraph',
                text: 'Super'
              },
              {
                type: 'Paragraph',
                text: 'Test!'
              }
            ]
          }
        }
      },
      tags: [ 'second-test', 'super-test' ]
    }
  ]
}

const queryDocumentsStub = sinon.stub().returns(queryResponse)
const apiStub = sinon.stub()

describe('fetchContent', () => {
  let fetchContent
  let cachedPrismicAccessToken

  beforeEach(() => {
    cachedPrismicAccessToken = process.env.PRISMICIO_WEB_ACCESS_TOKEN
    process.env.PRISMICIO_WEB_ACCESS_TOKEN = 'TEST_PRISMIC_ACCESS_TOKEN'
    fetchContent = proxyquire('../../../../gql/lib/prismic/fetch-content', {
      './query-documents': queryDocumentsStub,
      './prismic': apiStub
    })
  })

  afterEach(() => {
    process.env.PRISMICIO_WEB_ACCESS_TOKEN = cachedPrismicAccessToken
    queryDocumentsStub.reset()
    apiStub.reset()
  })

  it('calls Prismic api with repo url and access token', async () => {
    await fetchContent(baseArgs)
    expect(apiStub).to.have.been.calledWith('web')
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
    apiStub.throws(new Error('Test Power: Over 9000'))
    expect(fetchContent(baseArgs))
      .to.eventually.be.rejectedWith('Test Power: Over 9000')
  })
})
