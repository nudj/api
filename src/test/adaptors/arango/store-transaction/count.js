/* eslint-env mocha */

const chai = require('chai')
const dedent = require('dedent')
const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

const expect = chai.expect
chai.use(sinonChai)

const DOCUMENT_RESPONSE = {
  _key: 'id',
  '_id': 123,
  '_rev': 123,
  prop: 'value'
}

describe('ArangoAdaptor Store().countByFilters', () => {
  let Store
  let dbStub

  before(() => {
    dbStub = {
      db: {
        _query: sinon.stub().returns({ toArray: () => [47] }),
        collectionName: {
          all: sinon.stub().returns({ toArray: () => [DOCUMENT_RESPONSE, DOCUMENT_RESPONSE] }),
          byExample: sinon.stub().returns({ toArray: () => [DOCUMENT_RESPONSE, DOCUMENT_RESPONSE] })
        }
      }
    }
    Store = proxyquire('../../../../gql/adaptors/arango/store-transaction', {
      '@arangodb': dbStub
    })
  })
  afterEach(() => {
    dbStub.db._query.reset()
    dbStub.db.collectionName.all.reset()
    dbStub.db.collectionName.byExample.reset()
  })

  describe('with no filters', () => {
    it('should fetch the data', () => {
      return Store().countByFilters({
        type: 'collectionName',
        filters: {}
      })
      .then(() => {
        expect(dbStub.db._query).to.have.been.called()
      })
    })

    it('should return the cumulative countByFilters of filtered entities', () => {
      return expect(Store().countByFilters({
        type: 'collectionName',
        filters: {}
      })).to.eventually.deep.equal(47)
    })
  })

  describe('with filters', () => {
    it('should fetch the data', () => {
      return Store().countByFilters({
        type: 'collectionName',
        filters: {
          test: 'value'
        }
      })
      .then(() => {
        const query = dbStub.db._query.firstCall.args[0]
        expect(query).to.include('FILTER item.test == "value"')
      })
    })

    it('should return normalised entities', () => {
      return expect(Store().countByFilters({
        type: 'collectionName',
        filters: {
          test: 'value'
        }
      })).to.eventually.deep.equal(47)
    })
  })

  describe('with date filters', () => {
    it('should fetch the data', () => {
      return Store().countByFilters({
        type: 'collectionName',
        filters: {
          dateTo: '2017-12-15T11:21:51.030+00:00',
          dateFrom: '2016-12-15T11:21:51.030+00:00'
        }
      })
      .then(() => {
        const [ query, bindVars ] = dbStub.db._query.firstCall.args
        expect(bindVars).to.deep.equal({
          from: '2016-12-15T00:00:00.000Z',
          to: '2017-12-15T23:59:59.999Z'
        })
        expect(dedent(query)).to.equal(dedent`
          RETURN COUNT(
          FOR item IN collectionName
          FILTER DATE_TIMESTAMP(item.created) <= DATE_TIMESTAMP(@to)
          FILTER DATE_TIMESTAMP(item.created) >= DATE_TIMESTAMP(@from)
          RETURN item
          )
        `)
      })
    })

    it('should return normalised entities', () => {
      return expect(Store().countByFilters({
        type: 'collectionName',
        filters: {
          dateTo: '2017-12-15T11:21:51.030+00:00',
          dateFrom: '2016-12-15T11:21:51.030+00:00'
        }
      })).to.eventually.deep.equal(47)
    })
  })
})
