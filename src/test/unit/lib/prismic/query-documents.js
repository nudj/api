/* eslint-env mocha */
const chai = require('chai')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

chai.use(sinonChai)

const expect = chai.expect

const DUMMY_PRISMIC_AT_CALL = 'DUMMY_PRISMIC_AT_CALL'
const DUMMY_PRISMIC_ANY_CALL = 'DUMMY_PRISMIC_ANY_CALL'

describe('queryDocuments', () => {
  let queryDocuments
  const prismicAnyStub = sinon.stub().returns(DUMMY_PRISMIC_ANY_CALL)
  const prismicAtStub = sinon.stub().returns(DUMMY_PRISMIC_AT_CALL)
  const type = 'testType'
  const tags = [
    'captain',
    'face',
    'strikes',
    'again'
  ]

  beforeEach(() => {
    queryDocuments = proxyquire('../../../../gql/lib/prismic/query-documents', {
      'prismic.io': {
        Predicates: {
          any: prismicAnyStub,
          at: prismicAtStub
        }
      }
    })
  })

  afterEach(() => {
    prismicAnyStub.reset()
    prismicAtStub.reset()
  })

  it('should call the Prismic api with the provided query', async () => {
    const api = { query: () => {} }
    queryDocuments({ api, type, tags })
    expect(prismicAnyStub).to.have.been.calledWith(
      'document.tags',
      [
        'captain',
        'face',
        'strikes',
        'again'
      ]
    )
    expect(prismicAtStub).to.have.been.calledWith(
      'document.type',
      'testType'
    )
  })

  it('should trigger `query` method on Prismic api', async () => {
    const api = { query: sinon.stub() }
    queryDocuments({ api, tags, type })
    expect(api.query).to.have.been.calledWith([
      DUMMY_PRISMIC_AT_CALL,
      DUMMY_PRISMIC_ANY_CALL
    ])
  })

  it('should return result of `query` method', async () => {
    const api = { query: (array) => array[1] + array[0] }
    const result = queryDocuments({ api, tags, type })
    expect(result).to.equal(DUMMY_PRISMIC_ANY_CALL + DUMMY_PRISMIC_AT_CALL)
  })
})
