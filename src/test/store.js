/* eslint-env mocha */
let chai = require('chai')
let dirtyChai = require('dirty-chai')
let chaiAsPromised = require('chai-as-promised')
let sinon = require('sinon')
let sinonChai = require('sinon-chai')
require('sinon-as-promised')
let proxyquire = require('proxyquire')

let expect = chai.expect
chai.use(sinonChai)
chai.use(chaiAsPromised)
chai.use(dirtyChai)

describe('Store', function () {
  let Store
  let fetchStub

  before(function () {
    fetchStub = sinon.stub().resolves({
      _key: '18598',
      _id: 'jobs/18598',
      _rev: '_UqxYheW---',
      title: 'some job'
    })
    Store = proxyquire('../lib/store', {
      'node-fetch': fetchStub
    })
  })
  afterEach(function () {
    fetchStub.reset()
  })

  describe('getOne', function () {
    let result

    beforeEach(function () {
      result = Store.getOne('jobs', {
        id: '18598'
      })
      return result
    })

    it('should fetch the data from the db', function () {
      expect(fetchStub).to.have.been.calledWith(`http://db:8529/_api/document/jobs/18598`)
    })

    it('should return the result of the db fetch', function () {
      return expect(result).to.eventually.deep.equal({
        id: '18598',
        title: 'some job'
      })
    })
  })
})
