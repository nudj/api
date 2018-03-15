/* eslint-env mocha */
const chai = require('chai')
const proxyquire = require('proxyquire')
const expect = chai.expect
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

chai.use(sinonChai)

const PRISMIC_SUCCESS_RESPONSE = 'PRISMIC_SUCCESS_RESPONSE'

const prismicStub = sinon.stub().returns([PRISMIC_SUCCESS_RESPONSE])
const resolverDefinitions = proxyquire('../../../../gql/schema/query/fetchJobTags', {
  '../../lib/prismic': { fetchTags: prismicStub }
})
const { fetchJobTags } = resolverDefinitions.resolvers.Query

describe('Query.fetchJobTags', () => {
  it('calls the Prismic tags fetcher', () => {
    fetchJobTags()
    expect(prismicStub).to.have.been.called()
  })

  it('returns response from Prismic tags fetcher', async () => {
    const tags = await fetchJobTags()
    expect(tags).to.deep.equal([PRISMIC_SUCCESS_RESPONSE])
  })
})
