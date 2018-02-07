/* eslint-env mocha */

const chai = require('chai')
const nock = require('nock')
const sinonChai = require('sinon-chai')
const expect = chai.expect

chai.use(sinonChai)

const { transaction } = require('../../../gql/adaptors/json-server')
const server = nock('http://localhost:81/')

describe('JSON-Server Store().readAll', () => {
  afterEach(() => {
    nock.cleanAll()
  })

  it('should fetch the filtered data', () => {
    server
      .get('/people')
      .query({ firstName: 'Daniel' })
      .reply(200, [
        {
          id: 'person1',
          firstName: 'Daniel',
          lastName: 'Radcliffe'
        }
      ])
    return transaction(store => {
      return store.readAll({
        type: 'people',
        filters: {
          firstName: 'Daniel'
        }
      })
    }).then(results => {
      expect(results).to.deep.equal([
        {
          id: 'person1',
          firstName: 'Daniel',
          lastName: 'Radcliffe'
        }
      ])
    })
  })

  it('should fetch data with multiple filters', () => {
    server
      .get('/people')
      .query({ firstName: 'David', lastName: 'Mitchell' })
      .reply(200, [
        {
          id: 'person1',
          firstName: 'David',
          lastName: 'Mitchell'
        }
      ])
    return transaction(store => {
      return store.readAll({
        type: 'people',
        filters: {
          firstName: 'David',
          lastName: 'Mitchell'
        }
      })
    }).then(results => {
      expect(results).to.deep.equal([
        {
          id: 'person1',
          firstName: 'David',
          lastName: 'Mitchell'
        }
      ])
    })
  })

  it('should fetch data with date filters', () => {
    server
      .get('/people')
      .query((queryObject) => {
        const { created_gte: from, created_lte: to } = queryObject
        const correctStartDate = to === '1986-07-07T23:59:59.999Z'
        const correctEndDate = from === '1986-07-09T00:00:00.000Z'
        return correctStartDate && correctEndDate
      })
      .reply(200, [
        {
          id: 'person1',
          firstName: 'Lord',
          lastName: 'Sugar',
          created: '1986-07-07T07:34:54.000+00:00'
        },
        {
          id: 'person2',
          firstName: 'Lady',
          lastName: 'Luck',
          created: '1986-07-09T07:34:54.000+00:00'
        }
      ])
    return transaction(store => {
      return store.readAll({
        type: 'people',
        filters: {
          dateTo: '1986-07-07T07:34:54.000+00:00',
          dateFrom: '1986-07-09T07:34:54.000+00:00'
        }
      })
    }).then(results => {
      expect(results).to.deep.equal([
        {
          id: 'person1',
          firstName: 'Lord',
          lastName: 'Sugar',
          created: '1986-07-07T07:34:54.000+00:00'
        },
        {
          id: 'person2',
          firstName: 'Lady',
          lastName: 'Luck',
          created: '1986-07-09T07:34:54.000+00:00'
        }
      ])
    })
  })
})
