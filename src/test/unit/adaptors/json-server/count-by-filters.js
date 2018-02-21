/* eslint-env mocha */

const chai = require('chai')
const nock = require('nock')
const sinonChai = require('sinon-chai')
const expect = chai.expect

chai.use(sinonChai)

const { transaction } = require('../../../../gql/adaptors/json-server')
const server = nock('http://localhost:81/')

describe('JSON-Server Store().countByFilters', () => {
  afterEach(() => {
    nock.cleanAll()
  })

  it('should fetch the complete count with no filters', () => {
    server
      .get('/ice-creams')
      .reply(200, [
        {
          id: 1,
          flavour: 'Vanilla',
          popularity: 'High'
        },
        {
          id: 2,
          flavour: 'Chocolate',
          popularity: 'High'
        },
        {
          id: 3,
          flavour: 'Banana',
          type: 'Fruit',
          popularity: 'Moderate'
        },
        {
          id: 4,
          flavour: 'Strawberry',
          type: 'Berry',
          popularity: 'Moderate'
        },
        {
          id: 4,
          flavour: 'Raspberry',
          type: 'Berry',
          popularity: 'Moderate'
        },
        {
          id: 5,
          flavour: 'Oyster',
          popularity: 'Very low'
        }
      ])
    return transaction(store => {
      return store.countByFilters({
        type: 'ice-creams',
        filters: {}
      })
    }).then(result => {
      expect(result).to.equal(6)
    })
  })

  it('should fetch the filtered count', () => {
    server
      .get('/ice-creams')
      .query({ popularity: 'High' })
      .reply(200, [
        {
          id: 1,
          flavour: 'Vanilla',
          popularity: 'High'
        },
        {
          id: 2,
          flavour: 'Chocolate',
          popularity: 'High'
        }
      ])
    return transaction(store => {
      return store.countByFilters({
        type: 'ice-creams',
        filters: {
          popularity: 'High'
        }
      })
    }).then(results => {
      expect(results).to.equal(2)
    })
  })

  it('should fetch the count with multiple filters', () => {
    server
      .get('/ice-creams')
      .query({ popularity: 'Moderate', type: 'Berry' })
      .reply(200, [
        {
          id: 4,
          flavour: 'Strawberry',
          type: 'Berry',
          popularity: 'Moderate'
        },
        {
          id: 4,
          flavour: 'Raspberry',
          type: 'Berry',
          popularity: 'Moderate'
        }
      ])
    return transaction(store => {
      return store.countByFilters({
        type: 'ice-creams',
        filters: {
          popularity: 'Moderate',
          type: 'Berry'
        }
      })
    }).then(results => {
      expect(results).to.equal(2)
    })
  })

  it('should fetch the count with date filters', () => {
    server
      .get('/soft-drinks')
      .query((queryObject) => {
        const { created_gte: from, created_lte: to } = queryObject
        const correctStartDate = to === '1986-07-08T23:59:59.999Z'
        const correctEndDate = from === '1986-07-07T00:00:00.000Z'
        return correctStartDate && correctEndDate
      })
      .reply(200, [
        {
          id: 1,
          name: 'Diet Coke',
          created: '1986-07-07T07:34:54.000+00:00'
        },
        {
          id: 2,
          name: 'Pepsi Cola',
          created: '1986-07-08T07:34:54.000+00:00'
        }
      ])
    return transaction(store => {
      return store.countByFilters({
        type: 'soft-drinks',
        filters: {
          dateFrom: '1986-07-07T07:34:54.000+00:00',
          dateTo: '1986-07-08T07:34:54.000+00:00'
        }
      })
    }).then(results => {
      expect(results).to.equal(2)
    })
  })
})
