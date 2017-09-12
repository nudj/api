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

describe('Arango.post', function () {
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

  describe('when post request is sucessful', function () {
    let result

    before(function () {
      fetchStub.withArgs('http://db:8529/_db/nudj/_api/document/type?returnNew=true').resolves({
        json: () => ({
          _key: '12345',
          _id: 'type/12345',
          _rev: '_UqxYheW---',
          error: false,
          code: 200
        })
      })
    })
    beforeEach(function () {
      result = Store.post('type', {
        title: 'new object'
      })
      return result
    })

    it('should post new document to db', function () {
      expect(fetchStub).to.have.been.calledWith('http://db:8529/_db/nudj/_api/document/type?returnNew=true')
      let options = fetchStub.getCall(0).args[1]
      expect(options).to.have.property('method', 'POST')
      expect(options).to.have.property('body')
      let body = JSON.parse(options.body)
      expect(body).to.have.property('title', 'new object')
      expect(body).to.have.property('created')
      expect(body).to.have.property('modified')
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
      return expect(Store.patch('type', 123, {
        id: '18598'
      })).to.eventually.deep.equal({
        code: 404,
        errorMessage: 'no match',
        error: true
      })
    })
  })

  describe('when request responds with error', function () {
    it('should resolve with error state', function () {
      fetchStub.withArgs('http://db:8529/_db/nudj/_api/document/type?returnNew=true').rejects(new Error())
      return expect(Store.post('type', {
        title: 'new object'
      })).to.eventually.be.rejectedWith(StoreError)
    })
  })
})
