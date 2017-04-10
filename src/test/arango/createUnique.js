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

describe('Arango.createUnique', function () {
  let Store
  let fetchStub

  before(function () {
    fetchStub = sinon.stub()
    Store = proxyquire('../../lib/arango', {
      'node-fetch': fetchStub
    })
  })
  afterEach(function () {
    fetchStub.reset()
  })

  describe('when db responds 404 on match check', function () {
    let result

    before(function () {
      fetchStub.withArgs('http://db:8529/_api/simple/first-example').resolves({
        json: () => ({
          document: {
            error: true,
            code: 404,
            errorNum: 404,
            errorMessage: 'no match'
          },
          error: false,
          code: 200
        })
      })
      fetchStub.withArgs('http://db:8529/_api/document/type?returnNew=true').resolves({
        json: () => ({
          _key: '12345',
          _id: 'type/12345',
          _rev: '_UqxYheW---',
          new: {
            _key: '12345',
            _id: 'type/12345',
            _rev: '_UqxYheW---',
            title: 'new item'
          },
          error: false,
          code: 200
        })
      })
    })
    beforeEach(function () {
      result = Store.createUnique('type', {
        title: 'new item'
      })
      return result
    })

    it('should check for an existing record with the same props', function () {
      expect(fetchStub).to.have.been.calledWith('http://db:8529/_api/simple/first-example', {
        method: 'PUT',
        body: JSON.stringify({
          collection: 'type',
          example: {
            title: 'new item'
          }
        })
      })
    })

    it('should post new document to db', function () {
      expect(fetchStub).to.have.been.calledWith('http://db:8529/_api/document/type?returnNew=true')
      let options = fetchStub.getCall(1).args[1]
      expect(options).to.have.property('method', 'POST')
      expect(options).to.have.property('body')
      let body = JSON.parse(options.body)
      expect(body).to.have.property('title', 'new item')
      expect(body).to.have.property('created')
      expect(body).to.have.property('modified')
    })

    it('should return the normalised result of the db fetch', function () {
      return expect(result).to.eventually.deep.equal({
        id: '12345',
        title: 'new item'
      })
    })
  })

  describe('when db responds with 200 on match check', function () {
    let result

    before(function () {
      fetchStub.withArgs('http://db:8529/_api/simple/first-example').resolves({
        json: () => ({
          document: {
            _key: '12345',
            _id: 'type/12345',
            _rev: '_UqxYheW---',
            title: 'new item'
          },
          error: false,
          code: 200
        })
      })
    })
    beforeEach(function () {
      result = Store.createUnique('type', {
        title: 'new item'
      })
      return result
    })

    it('should check for an existing record with the same props', function () {
      expect(fetchStub).to.have.been.calledWith('http://db:8529/_api/simple/first-example', {
        method: 'PUT',
        body: JSON.stringify({
          collection: 'type',
          example: {
            title: 'new item'
          }
        })
      })
    })

    it('should not call the create endpoint', function () {
      expect(fetchStub).to.not.have.been.calledWith('http://db:8529/_api/document/type?returnNew=true')
    })

    it('should resolve with error state', function () {
      return expect(result).to.eventually.deep.equal({
        code: 409,
        errorMessage: 'already exists',
        error: true,
        document: {
          id: '12345',
          title: 'new item'
        }
      })
    })
  })

  describe('when match check rejects with error', function () {
    it('should reject with Error', function () {
      fetchStub.withArgs('http://db:8529/_api/simple/first-example').rejects(new Error())
      return expect(Store.createUnique('type', {
        title: 'new item'
      })).to.eventually.be.rejectedWith(StoreError)
    })
  })

  describe('when create rejects with error', function () {
    it('should reject with Error', function () {
      fetchStub.withArgs('http://db:8529/_api/simple/first-example').resolves({
        json: () => ({
          document: {
            error: true,
            code: 404,
            errorNum: 404,
            errorMessage: 'no match'
          },
          error: false,
          code: 200
        })
      })
      fetchStub.withArgs('http://db:8529/_api/document/type?returnNew=true').rejects(new Error())
      return expect(Store.createUnique('type', {
        title: 'new item'
      })).to.eventually.be.rejectedWith(StoreError)
    })
  })
})
