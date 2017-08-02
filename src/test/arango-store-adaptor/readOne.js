/* eslint-env mocha */

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const dirtyChai = require('dirty-chai')
const nock = require('nock')
const expect = chai.expect

chai.use(chaiAsPromised)
chai.use(dirtyChai)

let StoreError = require('../../lib/errors').StoreError
let StoreAdaptor = require('../../gql/arango-store-adaptor')
let server

describe('ArangoStoreAdaptor.readOne', () => {
  before(() => {
    server = nock('http://localhost:82/_api')
    StoreAdaptor = StoreAdaptor({ baseURL: 'http://localhost:82/_api' })
  })
  afterEach(() => {
    nock.cleanAll()
  })
  it('returns a promise', () => {
    server.get('/document/test/1').reply(200)
    expect(StoreAdaptor.readOne({
      type: 'test',
      id: 1
    })).to.be.an.instanceof(Promise)
  })
  it('gets from arango by id', () => {
    server.get('/document/test/1').reply(200)
    return expect(StoreAdaptor.readOne({
      type: 'test',
      id: 1
    })).to.be.fulfilled()
  })
  it('resolves by id with the response', () => {
    server.get('/document/test/1').reply(200, { prop: 'value' })
    return expect(StoreAdaptor.readOne({
      type: 'test',
      id: 1
    })).to.become({ prop: 'value' })
  })
  it('resolves by id with the response', () => {
    server.get('/document/test/1').reply(200, { _key: 'id', _id: 123, _rev: 123, prop: 'value' })
    return expect(StoreAdaptor.readOne({
      type: 'test',
      id: 1
    })).to.become({ id: 'id', prop: 'value' })
  })
  it('gets from arango by filters', () => {
    server.put('/simple/first-example', {
      collection: 'test',
      example: {
        filter: true
      }
    })
    .reply(200)
    return expect(StoreAdaptor.readOne({
      type: 'test',
      filters: {
        filter: true
      }
    })).to.be.fulfilled()
  })
  it('resolves by filters with the response', () => {
    server.put('/simple/first-example', {
      collection: 'test',
      example: {
        filter: true
      }
    })
    .reply(200, {
      document: { prop: 'value' },
      error: false,
      code: 200
    })
    return expect(StoreAdaptor.readOne({
      type: 'test',
      filters: {
        filter: true
      }
    })).to.become({ prop: 'value' })
  })
  it('resolves by filters with the normalised response', () => {
    server.put('/simple/first-example', {
      collection: 'test',
      example: {
        filter: true
      }
    })
    .reply(200, {
      document: { _key: 'id', _id: 123, _rev: 123, prop: 'value' },
      error: false,
      code: 200
    })
    return expect(StoreAdaptor.readOne({
      type: 'test',
      filters: {
        filter: true
      }
    })).to.become({ id: 'id', prop: 'value' })
  })
  it('handles errors', () => {
    server.get('/document/test/1').reply(400, {
      error: true,
      errorMessage: 'Error message',
      code: 400,
      errorNum: 600
    })
    return expect(StoreAdaptor.readOne({
      type: 'test',
      id: 1
    })).to.be.rejectedWith(StoreError)
  })
  it('passes through error code', () => {
    server.get('/document/test/1').reply(400, {
      error: true,
      errorMessage: 'Error message',
      code: 400,
      errorNum: 600
    })
    return expect(StoreAdaptor.readOne({
      type: 'test',
      id: 1
    }).catch(error => error.code)).to.become(400)
  })
})
