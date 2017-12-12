/* eslint-env mocha */

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const dirtyChai = require('dirty-chai')
const nock = require('nock')
const expect = chai.expect

chai.use(chaiAsPromised)
chai.use(dirtyChai)

const StoreError = require('../../lib/errors').StoreError
let StoreAdaptor = require('../../gql-old/arango-store-adaptor')
let server

describe('ArangoStoreAdaptor.readOneOrCreate', () => {
  before(() => {
    server = nock('http://localhost:82/_api')
    StoreAdaptor = StoreAdaptor({ baseURL: 'http://localhost:82/_api' })
  })
  afterEach(() => {
    nock.cleanAll()
  })

  describe('when item exists', () => {
    beforeEach(() => {
      server.put('/simple/first-example', {
        collection: 'test',
        example: {
          filterKey: 'filterValue'
        }
      })
      .reply(200, {
        document: { _key: 'id', _id: 123, _rev: 123, prop: 'value' },
        error: false,
        code: 200
      })
    })

    it('returns existing item', () => {
      return expect(StoreAdaptor.readOneOrCreate({
        type: 'test',
        filters: {
          filterKey: 'filterValue'
        },
        data: {
          dataKey: 'dataValue'
        }
      })).to.eventually.deep.equal({
        id: 'id',
        prop: 'value'
      })
    })
  })

  describe('when item does not exist', () => {
    beforeEach(() => {
      server.put('/simple/first-example', {
        collection: 'test',
        example: {
          filterKey: 'filterValue'
        }
      })
      .reply(404)
      server
        .post('/document/test', { dataKey: 'dataValue' })
        .query({
          returnNew: true
        })
        .reply(200, { _key: 'id', _id: 123, _rev: 123, prop: 'value' })
    })

    it('returns new item', () => {
      return expect(StoreAdaptor.readOneOrCreate({
        type: 'test',
        filters: {
          filterKey: 'filterValue'
        },
        data: {
          dataKey: 'dataValue'
        }
      })).to.eventually.deep.equal({
        id: 'id',
        prop: 'value'
      })
    })
  })
  describe('when errors occur', () => {
    it('rejects with StoreError', () => {
      server.put('/simple/first-example', {
        collection: 'test',
        example: {
          filterKey: 'filterValue'
        }
      })
      .reply(400, {
        error: true,
        errorMessage: 'Error message',
        code: 400,
        errorNum: 600
      })
      return expect(StoreAdaptor.readOneOrCreate({
        type: 'test',
        filters: {
          filterKey: 'filterValue'
        },
        data: {
          dataKey: 'dataValue'
        }
      })).to.be.rejectedWith(StoreError)
    })
  })
})
