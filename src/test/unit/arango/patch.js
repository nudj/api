/* eslint-env mocha */
let chai = require('chai')
let dirtyChai = require('dirty-chai')
let chaiAsPromised = require('chai-as-promised')
let sinon = require('sinon')
let sinonChai = require('sinon-chai')
require('sinon-as-promised')
let proxyquire = require('proxyquire')

let StoreError = require('../../../lib/errors').StoreError

let expect = chai.expect
chai.use(sinonChai)
chai.use(chaiAsPromised)
chai.use(dirtyChai)

describe('Arango.patch', function () {
  let Store
  let fetchStub

  before(function () {
    fetchStub = sinon.stub()
    Store = proxyquire('../../../rest/arango', {
      'node-fetch': fetchStub
    })
  })
  afterEach(function () {
    fetchStub.reset()
  })

  describe('when item exists', function () {
    let result

    before(function () {
      fetchStub.resolves({
        json: () => ({
          new: {
            _key: '18598',
            _id: 'jobs/18598',
            _rev: '_UqxYheW---',
            prop: 'value'
          },
          error: false,
          code: 200
        })
      })
    })
    beforeEach(function () {
      result = Store.patch('type', 123, {
        prop: 'value'
      })
      return result
    })

    it('should send the patch to the db', function () {
      expect(fetchStub).to.have.been.calledWith('http://db:8529/_db/nudj/_api/document/type/123?returnNew=true')
      let options = fetchStub.getCall(0).args[1]
      expect(options).to.have.property('method', 'PATCH')
      expect(options).to.have.property('body')
      let body = JSON.parse(options.body)
      expect(body).to.have.property('prop', 'value')
      expect(body).to.have.property('modified')
      expect(body).to.not.have.property('created')
    })

    it('should return the normalised result of the db fetch', function () {
      return expect(result).to.eventually.deep.equal({
        id: '18598',
        prop: 'value'
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
      return expect(Store.post('type', {
        title: 'new title'
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
      return expect(Store.patch('type', 123, {
        id: '18598'
      })).to.eventually.be.rejectedWith(StoreError)
    })
  })
})
