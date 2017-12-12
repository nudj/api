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

describe('ArangoStoreAdaptor.readAll', () => {
  before(() => {
    server = nock('http://localhost:82/_api')
    StoreAdaptor = StoreAdaptor({ baseURL: 'http://localhost:82/_api' })
  })
  afterEach(() => {
    nock.cleanAll()
  })
  it('returns a promise', () => {
    server.put('/simple/all', {
      collection: 'test'
    }).reply(200, { result: [] })
    expect(StoreAdaptor.readAll({
      type: 'test'
    })).to.be.an.instanceof(Promise)
  })
  it('gets all from arango', () => {
    server.put('/simple/all', {
      collection: 'test'
    }).reply(200, { result: [] })
    return expect(StoreAdaptor.readAll({
      type: 'test'
    })).to.be.fulfilled()
  })
  it('resolves with the response', () => {
    server.put('/simple/all', {
      collection: 'test'
    }).reply(200, {
      result: [{ prop: 'value' }],
      hasMore: false,
      count: 2,
      cached: false,
      extra: {
        stats: {
          writesExecuted: 0,
          writesIgnored: 0,
          scannedFull: 4,
          scannedIndex: 0,
          filtered: 0,
          executionTime: 0.00027108192443847656
        },
        warnings: [ ]
      },
      error: false,
      code: 201
    })
    return expect(StoreAdaptor.readAll({
      type: 'test'
    })).to.become([{ prop: 'value' }])
  })
  it('normalises the response', () => {
    server.put('/simple/all', {
      collection: 'test'
    }).reply(200, {
      result: [{ _key: 'id', _id: 123, _rev: 123, prop: 'value' }],
      hasMore: false,
      count: 2,
      cached: false,
      extra: {
        stats: {
          writesExecuted: 0,
          writesIgnored: 0,
          scannedFull: 4,
          scannedIndex: 0,
          filtered: 0,
          executionTime: 0.00027108192443847656
        },
        warnings: [ ]
      },
      error: false,
      code: 201
    })
    return expect(StoreAdaptor.readAll({
      type: 'test'
    })).to.become([{ id: 'id', prop: 'value' }])
  })
  it('gets from arango by filters', () => {
    server.put('/simple/by-example', {
      collection: 'test',
      example: {
        filter: true
      }
    })
    .reply(200, { result: [] })
    return expect(StoreAdaptor.readAll({
      type: 'test',
      filters: {
        filter: true
      }
    })).to.be.fulfilled()
  })
  it('resolves by filters with the response', () => {
    server.put('/simple/by-example', {
      collection: 'test',
      example: {
        filter: true
      }
    })
    .reply(200, {
      result: [{ prop: 'value' }],
      hasMore: false,
      count: 4,
      error: false,
      code: 201
    })
    return expect(StoreAdaptor.readAll({
      type: 'test',
      filters: {
        filter: true
      }
    })).to.become([{ prop: 'value' }])
  })
  it('resolves by filters with the normalised response', () => {
    server.put('/simple/by-example', {
      collection: 'test',
      example: {
        filter: true
      }
    })
    .reply(200, {
      result: [{ _key: 'id', _id: 123, _rev: 123, prop: 'value' }],
      hasMore: false,
      count: 4,
      error: false,
      code: 201
    })
    return expect(StoreAdaptor.readAll({
      type: 'test',
      filters: {
        filter: true
      }
    })).to.become([{ id: 'id', prop: 'value' }])
  })
  it('handles errors', () => {
    server.put('/simple/by-example', {
      collection: 'test',
      example: {
        filter: true
      }
    }).reply(400, {
      error: true,
      errorMessage: 'Error message',
      code: 400,
      errorNum: 600
    })
    return expect(StoreAdaptor.readAll({
      type: 'test',
      filters: {
        filter: true
      }
    })).to.be.rejectedWith(StoreError)
  })
})
