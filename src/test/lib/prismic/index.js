/* eslint-env mocha */
require('envkey')
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

const apiStub = { query: sinon.stub().returns(queryResponse) }
const prismicStub = sinon.stub().returns(apiStub)
const fetchContent = proxyquire('../../../gql/lib/prismic', {
  'prismic.io': {
    api: prismicStub
  }
})

describe('fetchContent', () => {
  afterEach(() => {
    apiStub.query.reset()
    prismicStub.reset()
  })

  it('calls Prismic api with repo url and access token', async () => {
    await fetchContent(baseArgs)
    expect(prismicStub).to.have.been.calledWith(
      `https://nudj-special-test.prismic.io/api`,
      { accessToken: process.env.PRISMICIO_ACCESS_TOKEN }
    )
  })

  it('queries Prismic api with formatted query', async () => {
    await fetchContent(baseArgs)
    expect(apiStub.query).to.have.been.calledWith([
      ['at', 'document.type', 'testing'],
      ['any', 'document.tags', ['test']]
    ])
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