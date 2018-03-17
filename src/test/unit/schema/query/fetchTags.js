/* eslint-env mocha */
const chai = require('chai')
const proxyquire = require('proxyquire')
const expect = chai.expect
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

chai.use(sinonChai)

const PRISMIC_SUCCESS_RESPONSE = 'PRISMIC_SUCCESS_RESPONSE'

const prismicStub = sinon.stub().returns([PRISMIC_SUCCESS_RESPONSE])
const resolverDefinitions = proxyquire('../../../../gql/schema/query/fetchTags', {
  '../../lib/prismic': { fetchTags: prismicStub }
})
const { fetchTags } = resolverDefinitions.resolvers.Query

describe('Query.fetchTags', () => {
  it('calls the Prismic tags fetcher', () => {
    const args = { repo: 'juan', type: 'arango' }
    fetchTags(null, args)
    expect(prismicStub).to.have.been.calledWith(args)
  })

  it('returns response from Prismic tags fetcher', async () => {
    const tags = await fetchTags(null, { repo: 'juan', type: 'arango' })
    expect(tags).to.deep.equal([PRISMIC_SUCCESS_RESPONSE])
  })
})
