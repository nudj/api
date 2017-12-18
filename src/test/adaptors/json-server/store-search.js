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
          name: 'Test Person',
          status: 'alive'
        },
        {
          id: 2,
          name: 'Juan Testango',
          status: 'alive'
        },
        {
          id: 3,
          name: 'Emperor Palpatine',
          status: 'deceased'
        },
        {
          id: 4,
          name: 'Emperor Caesar',
          status: 'deceased'
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
        query: 'Test',
        fields: ['name']
      })
    }).then(results => {
      expect(results).to.deep.equal([
        {
          id: 1,
          name: 'Test Person',
          status: 'alive'
        },
        {
          id: 2,
          name: 'Juan Testango',
          status: 'alive'
        }
      ])
    })
  })

  it('should fetch data from incomplete string', () => {
    return transaction(store => {
      return store.search({
        type: 'connections',
        query: 'Pers',
        fields: ['name']
      })
    }).then(results => {
      expect(results).to.deep.equal([
        {
          id: 1,
          name: 'Test Person',
          status: 'alive'
        }
      ])
    })
  })

  it('should fetch data with multiple fields', () => {
    return transaction(store => {
      return store.search({
        type: 'connections',
        query: 'al',
        fields: ['name', 'status']
      })
    }).then(results => {
      expect(results).to.deep.equal([
        {
          id: 3,
          name: 'Emperor Palpatine',
          status: 'deceased'
        },
        {
          id: 1,
          name: 'Test Person',
          status: 'alive'
        },
        {
          id: 2,
          name: 'Juan Testango',
          status: 'alive'
        }
      ])
    })
  })

  it('should fetch data with spaced query', () => {
    return transaction(store => {
      return store.search({
        type: 'connections',
        query: 'Emperor Palpatine',
        fields: ['name']
      })
    })
    .then(results => {
      expect(results).to.deep.equal([
        {
          id: 3,
          name: 'Emperor Palpatine',
          status: 'deceased'
        }
      ])
    })
  })
})
