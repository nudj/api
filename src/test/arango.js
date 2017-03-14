/* eslint-env mocha */
let chai = require('chai')
let dirtyChai = require('dirty-chai')
let chaiAsPromised = require('chai-as-promised')
let sinon = require('sinon')
let sinonChai = require('sinon-chai')
require('sinon-as-promised')
let proxyquire = require('proxyquire')

let StoreError = require('../lib/errors').StoreError

let expect = chai.expect
chai.use(sinonChai)
chai.use(chaiAsPromised)
chai.use(dirtyChai)

describe('Arango', function () {
  let Store
  let fetchStub

  before(function () {
    fetchStub = sinon.stub()
    Store = proxyquire('../lib/arango', {
      'node-fetch': fetchStub
    })
  })
  afterEach(function () {
    fetchStub.reset()
  })

  describe('getOne', function () {
    let result

    describe('when db responds with data', function () {
      before(function () {
        fetchStub.resolves({
          json: () => ({
            _key: '18598',
            _id: 'jobs/18598',
            _rev: '_UqxYheW---',
            title: 'some job'
          })
        })
      })
      beforeEach(function () {
        result = Store.getOne('jobs', {
          id: '18598'
        })
        return result
      })

      it('should fetch the data from the db', function () {
        expect(fetchStub).to.have.been.calledWith(`http://db:8529/_api/document/jobs/18598`)
      })

      it('should return the normalised result of the db fetch', function () {
        return expect(result).to.eventually.deep.equal({
          id: '18598',
          title: 'some job'
        })
      })
    })

    describe('when db responds with error', function () {
      it('should resolve with error state', function () {
        fetchStub.resolves({
          json: () => ({
            error: true,
            errorMessage: 'document not found',
            code: 404,
            errorNum: 1202
          })
        })
        return expect(Store.getOne('jobs', {
          id: '18598'
        })).to.eventually.deep.equal({
          code: 404,
          message: 'document not found',
          error: true
        })
      })
    })

    describe('when fetch rejects with error', function () {
      it('should reject with Error', function () {
        fetchStub.rejects(new Error())
        return expect(Store.getOne('jobs', {
          id: '18598'
        })).to.eventually.be.rejectedWith(StoreError)
      })
    })
  })
})
