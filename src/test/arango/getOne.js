/* eslint-env mocha */
let chai = require('chai')
let dirtyChai = require('dirty-chai')
let chaiAsPromised = require('chai-as-promised')
let sinon = require('sinon')
let sinonChai = require('sinon-chai')
require('sinon-as-promised')
let proxyquire = require('proxyquire')

let StoreError = require('../../lib/errors').StoreError

let expect = chai.expect
chai.use(sinonChai)
chai.use(chaiAsPromised)
chai.use(dirtyChai)

describe('Arango.getOne', function () {
  let Store
  let fetchStub

  before(function () {
    fetchStub = sinon.stub()
    Store = proxyquire('../../rest/arango', {
      'node-fetch': fetchStub
    })
  })
  afterEach(function () {
    fetchStub.reset()
  })

  describe('when db responds with data', function () {
    let result

    before(function () {
      fetchStub.resolves({
        json: () => ({
          document: {
            _key: '18598',
            _id: 'jobs/18598',
            _rev: '_UqxYheW---',
            title: 'some job'
          },
          error: false,
          code: 200
        })
      })
    })
    beforeEach(function () {
      result = Store.getOne('type', {
        id: '18598'
      })
      return result
    })

    it('should fetch the data from the db', function () {
      expect(fetchStub).to.have.been.calledWith('http://db:8529/_db/nudj/_api/simple/first-example')
      let options = fetchStub.getCall(0).args[1]
      expect(options).to.have.property('method', 'PUT')
      expect(options).to.have.property('body')
      expect(options).to.have.deep.property('headers.Authorization')
      let body = JSON.parse(options.body)
      expect(body).to.have.property('collection', 'type')
      expect(body).to.have.deep.property('example._key', '18598')
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
          code: 404,
          errorNum: 404,
          errorMessage: 'no match'
        })
      })
      return expect(Store.getOne('type', {
        id: '18598'
      })).to.eventually.deep.equal({
        code: 404,
        errorMessage: 'no match',
        error: true
      })
    })
  })

  describe('when fetch rejects with error', function () {
    it('should reject with Error', function () {
      fetchStub.rejects(new Error())
      return expect(Store.getOne('type', {
        id: '18598'
      })).to.eventually.be.rejectedWith(StoreError)
    })
  })
})
