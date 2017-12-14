/* eslint-env mocha */

const chai = require('chai')
const nock = require('nock')
const sinonChai = require('sinon-chai')
const expect = chai.expect

chai.use(sinonChai)

const transaction = require('../../../gql/adaptors/json-server')
const server = nock('http://localhost:81/')

describe.only('JSON-Server Store().search', () => {
  beforeEach(() => {
    server
      .get('/connections')
      .query({
        firstName_like: 'Tes'
      })
      .reply(200, [
        {
          id: 1,
          firstName: 'Test',
          lastName: 'Person'
        }
      ])
    server
      .get('/connections')
      .query({
        lastName_like: 'Tes'
      })
      .reply(200, [
        {
          id: 2,
          firstName: 'Juan',
          lastName: 'Testango'
        }
      ])
  })

  afterEach(() => {
    nock.cleanAll()
  })

  it('should fetch the data', () => {
    return transaction(store => {
      return store.search({
        type: 'connections',
        fields: ['firstName'],
        query: 'Tes'
      })
    }).then(results => {
      expect(results).to.deep.equal([
        {
          id: 1,
          firstName: 'Test',
          lastName: 'Person'
        }
      ])
    })
  })

  it('should fetch data from multiple fields', () => {
    return transaction(store => {
      return store.search({
        type: 'connections',
        fields: ['firstName', 'lastName'],
        query: 'Tes'
      })
    }).then(results => {
      expect(results).to.deep.equal([
        {
          id: 1,
          firstName: 'Test',
          lastName: 'Person'
        },
        {
          id: 2,
          firstName: 'Juan',
          lastName: 'Testango'
        }
      ])
    })
  })
  it('should fetch nothing with empty query', () => {
    return transaction(store => {
      return store.search({
        type: 'connections',
        fields: [],
        query: 'Tes'
      })
    }).then(results => {
      expect(results).to.deep.equal([])
    })
  })
})
