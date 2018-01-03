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
          name: 'Force Ghost',
          rank: 'Spirit',
          allegiance: 'The Force'
        },
        {
          id: 2,
          name: 'Darth Maul',
          rank: 'Sith Lord',
          allegiance: 'Sith'
        },
        {
          id: 3,
          name: 'Darth Sidious',
          rank: 'Emperor',
          allegiance: 'Sith'
        },
        {
          id: 4,
          name: 'Aayla Secura',
          rank: 'Jedi',
          allegiance: 'Republic'
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
        query: 'Sith',
        fields: [['allegiance']]
      })
    }).then(results => {
      expect(results).to.deep.equal([
        {
          id: 2,
          name: 'Darth Maul',
          rank: 'Sith Lord',
          allegiance: 'Sith'
        },
        {
          id: 3,
          name: 'Darth Sidious',
          rank: 'Emperor',
          allegiance: 'Sith'
        }
      ])
    })
  })

  it('should fetch data from incomplete string', () => {
    return transaction(store => {
      return store.search({
        type: 'connections',
        query: 'gh',
        fields: [['name']]
      })
    }).then(results => {
      expect(results).to.deep.equal([
        {
          id: 1,
          name: 'Force Ghost',
          rank: 'Spirit',
          allegiance: 'The Force'
        }
      ])
    })
  })

  it('should fetch data with multiple fields', () => {
    return transaction(store => {
      return store.search({
        type: 'connections',
        query: 'or',
        fields: [['name'], ['rank']]
      })
    }).then(results => {
      expect(results).to.deep.equal([
        {
          id: 1,
          name: 'Force Ghost',
          rank: 'Spirit',
          allegiance: 'The Force'
        },
        {
          id: 2,
          name: 'Darth Maul',
          rank: 'Sith Lord',
          allegiance: 'Sith'
        },
        {
          id: 3,
          name: 'Darth Sidious',
          rank: 'Emperor',
          allegiance: 'Sith'
        }
      ])
    })
  })

  it('should fetch data with mutliple fields joined', () => {
    return transaction(store => {
      return store.search({
        type: 'connections',
        query: 'Republic Jedi',
        fields: [['allegiance', 'rank']]
      })
    })
    .then(results => {
      expect(results).to.deep.equal([
        {
          id: 4,
          name: 'Aayla Secura',
          rank: 'Jedi',
          allegiance: 'Republic'
        }
      ])
    })
  })

  it('should fetch data with mutliple fields joined on one match', () => {
    return transaction(store => {
      return store.search({
        type: 'connections',
        query: 'Sith Emperor',
        fields: [['allegiance', 'rank']]
      })
    })
    .then(results => {
      expect(results).to.deep.equal([
        {
          id: 3,
          name: 'Darth Sidious',
          rank: 'Emperor',
          allegiance: 'Sith'
        }
      ])
    })
  })

  it('should fetch data with filters', () => {
    server
      .get('/connections/filter')
      .query({ allegiance: 'Sith' })
      .reply(200, [
        {
          id: 2,
          name: 'Darth Maul',
          rank: 'Sith Lord',
          allegiance: 'Sith'
        },
        {
          id: 3,
          name: 'Darth Sidious',
          rank: 'Emperor',
          allegiance: 'Sith'
        }
      ])

    return transaction(store => {
      return store.search({
        type: 'connections',
        query: 'S',
        fields: [['name']],
        filters: {
          allegiance: 'Sith'
        }
      })
    }).then(results => {
      expect(results).to.deep.equal([
        {
          id: 3,
          name: 'Darth Sidious',
          rank: 'Emperor',
          allegiance: 'Sith'
        }
      ])
    })
  })
})
