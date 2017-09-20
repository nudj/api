/* eslint-env mocha */

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const dirtyChai = require('dirty-chai')
const nock = require('nock')
const proxyquire = require('proxyquire')
const expect = chai.expect

chai.use(chaiAsPromised)
chai.use(dirtyChai)

const Store = require('../../rest/arango')
const StoreError = require('../../lib/errors').StoreError

describe('Arango.del', function () {
  let server

  before(() => {
    server = nock('http://db:8529/_db/nudj/_api/')
  })
  afterEach(() => {
    nock.cleanAll()
  })

  describe('when item exists', function () {
    it('should send the delete request to the db', () => {
      server
        .delete('/document/delete-test/35')
        .query({
          returnOld: true
        })
        .reply(200, {
          _key: '1',
          _id: '1010',
          _rev: '10202'
        })
      return expect(Store.del('delete-test', 35)).to.be.fulfilled()
    })

    it('should return the normalised result of the db request', () => {
      server
        .delete('/document/test/1')
        .query({
          returnOld: true
        })
        .reply(200, {
          old: {
            _key: 'id',
            _id: 123,
            _rev: 123,
            prop: 'value'
          }
        })
      return expect(Store.del('test', 1)).to.become({ id: 'id', prop: 'value' })
    })
  })

  describe('when db responds with error', function () {
    it('should resolve with error state', () => {
      server
        .delete('/document/test/1')
        .query({
          returnOld: true
        })
        .reply(400, {
          error: true,
          errorMessage: 'Error message',
          code: 400,
          errorNum: 400
        })
      return expect(Store.del('test', 1)).to.become({
        code: 400,
        error: true,
        errorMessage: 'Error message'
      })
    })
  })

  describe('when fetch rejects with error', function () {
    it('should reject with error', () => {
      server
        .delete('/document/test/1')
        .query({
          returnOld: true
        })
        .replyWithError(new Error())
      return expect(Store.del('test', 1)).to.eventually.be.rejectedWith(StoreError)
    })
  })
})
