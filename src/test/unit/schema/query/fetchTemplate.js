/* eslint-env mocha */
const chai = require('chai')
const proxyquire = require('proxyquire')
const expect = chai.expect
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

chai.use(sinonChai)

const prismicStub = sinon.stub()
const fetchTemplateDefinitions = proxyquire('../../../../gql/schema/query/fetchTemplate', {
  '../../lib/prismic': prismicStub
})
const { fetchTemplate } = fetchTemplateDefinitions.resolvers.Query

describe('Query.fetchTemplate', () => {
  it('should call the Prismic content fetcher', () => {
    const args = {
      type: 'testingtemplate',
      repo: 'special-test',
      tags: [ 'test' ],
      keys: {
        'document.testing': 'Supertest'
      }
    }
    fetchTemplate({}, args)
    expect(prismicStub).to.have.been.calledWith(args)
  })
})
