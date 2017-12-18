/* eslint-env mocha */

const chai = require('chai')
const nock = require('nock')
const sinonChai = require('sinon-chai')
const expect = chai.expect

chai.use(sinonChai)

const transaction = require('../../../gql/adaptors/json-server')
const server = nock('http://localhost:81/')

describe('JSON-Server Store().search', () => {
  beforeEach(() => {
    server
      .get('/connections')
      .reply(200, [
        {
          id: 1,
          firstName: 'Test',
          lastName: 'Person'
        },
        {
          id: 2,
          firstName: 'Juan',
          lastName: 'Testango'
        },
        {
          id: 3,
          firstName: 'Emperor',
          lastName: 'Palpatine'
        },
        {
          id: 4,
          firstName: 'Emperor',
          lastName: 'Caesar'
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
        query: 'Test'
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

  it('should fetch data from incomplete string', () => {
    return transaction(store => {
      return store.search({
        type: 'connections',
        query: 'Pers'
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

  it('should fetch data with spaced query', () => {
    return transaction(store => {
      return store.search({
        type: 'connections',
        query: 'Emperor Palpatine'
      })
    }).then(results => {
      expect(results).to.deep.equal([
        {
          id: 3,
          firstName: 'Emperor',
          lastName: 'Palpatine'
        }
      ])
    })
  })
})
