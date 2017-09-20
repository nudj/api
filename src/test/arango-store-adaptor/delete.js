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

describe('ArangoStoreAdaptor.delete', () => {
  before(() => {
    server = nock('http://localhost:82/_api')
    StoreAdaptor = StoreAdaptor({ baseURL: 'http://localhost:82/_api' })
  })
  afterEach(() => {
    nock.cleanAll()
  })
  it('returns a promise', () => {
    server
      .delete('/document/test/1')
      .query({
        returnOld: true
      })
      .reply(200)
    expect(StoreAdaptor.delete({
      type: 'test',
      id: 1
    })).to.be.an.instanceof(Promise)
  })
  it('deletes to arango', () => {
    server
      .delete('/document/test/1')
      .query({
        returnOld: true
      })
      .reply(200)
    return expect(StoreAdaptor.delete({
      type: 'test',
      id: 1
    })).to.be.fulfilled()
  })
  it('resolves with the deleted object', () => {
    server
      .delete('/document/test/1')
      .query({
        returnOld: true
      })
      .reply(200, { old: { prop: 'value' } })
    return expect(StoreAdaptor.delete({
      type: 'test',
      id: 1
    })).to.become({ prop: 'value' })
  })
  it('normalises the result', () => {
    server
      .delete('/document/test/1')
      .query({
        returnOld: true
      })
      .reply(200, { old: { _key: 'id', _id: 123, _rev: 123, prop: 'value' } })
    return expect(StoreAdaptor.delete({
      type: 'test',
      id: 1
    })).to.become({ id: 'id', prop: 'value' })
  })
  it('handles errors', () => {
    server
      .delete('/document/test/1')
      .query({
        returnOld: true
      })
      .reply(400, {
        error: true,
        errorMessage: 'Error message',
        code: 400,
        errorNum: 600
      })
    return expect(StoreAdaptor.delete({
      type: 'test',
      id: 1
    })).to.be.rejectedWith(StoreError)
  })
  it('passes through error code', () => {
    server
      .delete('/document/test/1')
      .query({
        returnOld: true
      })
      .reply(400, {
        error: true,
        errorMessage: 'Error message',
        code: 400,
        errorNum: 600
      })
    return expect(StoreAdaptor.delete({
      type: 'test',
      id: 1
    }).catch(error => error.code)).to.become(400)
  })
})
