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
let StoreAdaptor = require('../../gql-old/arango-store-adaptor')
let server

describe('ArangoStoreAdaptor.create', () => {
  before(() => {
    server = nock('http://localhost:82/_api')
    StoreAdaptor = StoreAdaptor({ baseURL: 'http://localhost:82/_api' })
  })
  afterEach(() => {
    nock.cleanAll()
  })
  it('returns a promise', () => {
    server
      .post('/document/test', { prop: 'value' })
      .query({
        returnNew: true
      })
      .reply(200)
    expect(StoreAdaptor.create({
      type: 'test',
      data: {
        prop: 'value'
      }
    })).to.be.an.instanceof(Promise)
  })
  it('posts to arango', () => {
    server
      .post('/document/test', { prop: 'value' })
      .query({
        returnNew: true
      })
      .reply(200)
    return expect(StoreAdaptor.create({
      type: 'test',
      data: {
        prop: 'value'
      }
    })).to.be.fulfilled()
  })
  it('resolves with the newly created object', () => {
    server
      .post('/document/test', { prop: 'value' })
      .query({
        returnNew: true
      })
      .reply(200, { new: { _key: 'id', prop: 'value' } })
    return expect(StoreAdaptor.create({
      type: 'test',
      data: {
        prop: 'value'
      }
    })).to.become({ id: 'id', prop: 'value' })
  })
  it('normalises the result', () => {
    server
      .post('/document/test', { prop: 'value' })
      .query({
        returnNew: true
      })
      .reply(200, { new: { _key: 'id', '_id': 123, '_rev': 123, prop: 'value' } })
    return expect(StoreAdaptor.create({
      type: 'test',
      data: {
        prop: 'value'
      }
    })).to.become({ id: 'id', prop: 'value' })
  })
  it('adds created and modified to data', () => {
    server
      .post('/document/test', (body) => {
        return body.created &&
        isValid(new Date(body.created)) &&
        differenceInMinutes(new Date(body.created), new Date()) < 1 &&
        body.modified &&
        isValid(new Date(body.modified)) &&
        differenceInMinutes(new Date(body.modified), new Date()) < 1
      })
      .query({
        returnNew: true
      })
      .reply(200)
    return expect(StoreAdaptor.create({
      type: 'test',
      data: {
        prop: 'value'
      }
    })).to.be.fulfilled()
  })
  it('handles errors', () => {
    server
      .post('/document/test', { prop: 'value' })
      .query({
        returnNew: true
      })
      .reply(400, {
        error: true,
        errorMessage: 'Error message',
        code: 400,
        errorNum: 600
      })
    return expect(StoreAdaptor.create({
      type: 'test',
      data: {
        prop: 'value'
      }
    })).to.be.rejectedWith(StoreError)
  })
})
