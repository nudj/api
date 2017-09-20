/* eslint-env mocha */

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const dirtyChai = require('dirty-chai')
const nock = require('nock')
const differenceInMinutes = require('date-fns/difference_in_minutes')
const isValid = require('date-fns/is_valid')
const expect = chai.expect

chai.use(chaiAsPromised)
chai.use(dirtyChai)

const StoreError = require('../../lib/errors').StoreError
let StoreAdaptor = require('../../gql/arango-store-adaptor')
let server

describe('ArangoStoreAdaptor.update', () => {
  before(() => {
    server = nock('http://localhost:82/_api')
    StoreAdaptor = StoreAdaptor({ baseURL: 'http://localhost:82/_api' })
  })
  afterEach(() => {
    nock.cleanAll()
  })
  it('returns a promise', () => {
    server
      .patch('/document/test/1', { prop: 'value' })
      .query({
        returnNew: true
      })
      .reply(200)
    expect(StoreAdaptor.update({
      type: 'test',
      id: 1,
      data: {
        key: 'value'
      }
    }).catch(() => {})).to.be.an.instanceof(Promise)
  })
  it('patches to arango', () => {
    server
      .patch('/document/test/1', { prop: 'value' })
      .query({
        returnNew: true
      })
      .reply(200)
    return expect(StoreAdaptor.update({
      type: 'test',
      id: 1,
      data: {
        prop: 'value'
      }
    })).to.be.fulfilled()
  })
  it('resolves with the newly updated object', () => {
    server
      .patch('/document/test/1', { prop: 'value' })
      .query({
        returnNew: true
      })
      .reply(200, {
        _id: 'products/9915',
        _key: '9915',
        _rev: '_VWLl9f2---',
        _oldRev: '_VWLl9fy---',
        new: { prop: 'value' }
      })
    return expect(StoreAdaptor.update({
      type: 'test',
      id: 1,
      data: {
        prop: 'value'
      }
    })).to.become({ prop: 'value' })
  })
  it('normalises the newly updated object', () => {
    server
      .patch('/document/test/1', { prop: 'value' })
      .query({
        returnNew: true
      })
      .reply(200, {
        _id: 'products/9915',
        _key: '9915',
        _rev: '_VWLl9f2---',
        _oldRev: '_VWLl9fy---',
        new: { _key: 'id', _id: 123, _rev: 123, prop: 'value' }
      })
    return expect(StoreAdaptor.update({
      type: 'test',
      id: 1,
      data: {
        prop: 'value'
      }
    })).to.become({ id: 'id', prop: 'value' })
  })
  it('adds modified to data', () => {
    server
      .patch('/document/test/1', (body) => {
        return body.modified &&
        isValid(new Date(body.modified)) &&
        differenceInMinutes(new Date(body.modified), new Date()) < 1
      })
      .query({
        returnNew: true
      })
      .reply(200)
    return expect(StoreAdaptor.update({
      type: 'test',
      id: 1,
      data: {
        prop: 'value'
      }
    })).to.be.fulfilled()
  })
  it('handles errors', () => {
    server
      .patch('/document/test/1', { prop: 'value' })
      .query({
        returnNew: true
      })
      .reply(400, {
        error: true,
        errorMessage: 'Error message',
        code: 400,
        errorNum: 600
      })
    return expect(StoreAdaptor.update({
      type: 'test',
      id: 1,
      data: {
        prop: 'value'
      }
    })).to.be.rejectedWith(StoreError)
  })
  it('passes through error code', () => {
    server
      .patch('/document/test/1', { prop: 'value' })
      .query({
        returnNew: true
      })
      .reply(400, {
        error: true,
        errorMessage: 'Error message',
        code: 400,
        errorNum: 600
      })
    return expect(StoreAdaptor.update({
      type: 'test',
      id: 1,
      data: {
        prop: 'value'
      }
    }).catch(error => error.code)).to.become(400)
  })
})
