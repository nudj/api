/* eslint-env mocha */

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const dirtyChai = require('dirty-chai')
const nock = require('nock')
const expect = chai.expect

chai.use(chaiAsPromised)
chai.use(dirtyChai)

const StoreError = require('../../lib/errors').StoreError
let StoreAdaptor = require('../../gql/arango-store-adaptor')
let server

describe('ArangoStoreAdaptor.readMany', () => {
  before(() => {
    server = nock('http://localhost:82/_api')
    StoreAdaptor = StoreAdaptor({ baseURL: 'http://localhost:82/_api' })
  })
  afterEach(() => {
    nock.cleanAll()
  })
  it('returns a promise', () => {
    server.get('/document/test/id1').reply(200, { prop: 'value1' })
    server.get('/document/test/id2').reply(200, { prop: 'value2' })
    expect(StoreAdaptor.readMany({
      type: 'test',
      ids: ['id1', 'id2']
    })).to.be.an.instanceof(Promise)
  })
  it('gets all from arango', () => {
    server.get('/document/test/id1').reply(200, { prop: 'value1' })
    server.get('/document/test/id2').reply(200, { prop: 'value2' })
    return expect(StoreAdaptor.readMany({
      type: 'test',
      ids: ['id1', 'id2']
    })).to.be.fulfilled()
  })
  it('resolves with an array of responses', () => {
    server.get('/document/test/id1').reply(200, { prop: 'value1' })
    server.get('/document/test/id2').reply(200, { prop: 'value2' })
    return expect(StoreAdaptor.readMany({
      type: 'test',
      ids: ['id1', 'id2']
    })).to.become([{ prop: 'value1' }, { prop: 'value2' }])
  })
  it('normalises the results', () => {
    server.get('/document/test/id1').reply(200, { _key: '1', '_id': 123, '_rev': 123, prop: 'value1' })
    server.get('/document/test/id2').reply(200, { _key: '2', '_id': 123, '_rev': 123, prop: 'value2' })
    return expect(StoreAdaptor.readMany({
      type: 'test',
      ids: ['id1', 'id2']
    })).to.become([{ id: '1', prop: 'value1' }, { id: '2', prop: 'value2' }])
  })
  it('handles errors', () => {
    server.get('/document/test/id1').reply(200, { prop: 'value1' })
    server.get('/document/test/id2').reply(400, {
      error: true,
      errorMessage: 'Error message',
      code: 400,
      errorNum: 600
    })
    return expect(StoreAdaptor.readMany({
      type: 'test',
      ids: ['id1', 'id2']
    })).to.be.rejectedWith(StoreError)
  })
})
