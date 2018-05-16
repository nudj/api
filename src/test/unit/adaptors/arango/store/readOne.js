/* eslint-env mocha */

const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect

const Store = require('../../../../../gql/adaptors/arango/store')

chai.use(sinonChai)

const DOCUMENT_RESPONSE = { _key: 123, '_id': 'collectionNames/123', '_rev': 456, prop: 'value' }

xdescribe('ArangoAdaptor store.readOne', () => {
  let collectionStub
  let dbStub
  let store
  let dataLoaderStub

  before(() => {
    collectionStub = {
      firstExample: sinon.stub().returns(DOCUMENT_RESPONSE)
    }
    dataLoaderStub = {}
    dataLoaderStub.prime = sinon.stub().returns(dataLoaderStub)
    dataLoaderStub.load = sinon.stub().returns(DOCUMENT_RESPONSE)
    dbStub = {
      db: {
        collection: sinon.stub().returns(collectionStub)
      },
      getDataLoader: sinon.stub().returns(dataLoaderStub)
    }
    store = Store(dbStub)
  })
  afterEach(() => {
    collectionStub.firstExample.reset()
    dbStub.db.collection.reset()
    dbStub.getDataLoader.reset()
    dataLoaderStub.prime.reset()
    dataLoaderStub.load.reset()
  })

  describe('by id', () => {
    let result

    beforeEach(async () => {
      result = await store.readOne({
        type: 'collectionName',
        id: 123
      })
    })

    it('should fetch dataLoader for type', () => {
      expect(dbStub.getDataLoader).to.have.been.calledWith('collectionName')
    })

    it('should load the item by id using the dataloader', () => {
      expect(dataLoaderStub.load).to.have.been.calledWith(123)
    })

    it('should return normalised entity', () => {
      return expect(result).to.deep.equal({
        id: 123,
        prop: 'value'
      })
    })
  })

  describe('by filters', () => {
    let result

    beforeEach(async () => {
      result = await store.readOne({
        type: 'collectionName',
        filters: {
          test: 'value'
        }
      })
    })

    it('should fetch the collection', async () => {
      expect(dbStub.db.collection).to.have.been.calledWith('collectionName')
    })

    it('should read the data by filters', async () => {
      const dataArgument = collectionStub.firstExample.firstCall.args[0]
      expect(dataArgument).to.deep.equal({
        test: 'value'
      })
    })

    it('should prime the dataLoader cache', () => {
      expect(dataLoaderStub.prime).to.have.been.calledWith(123, DOCUMENT_RESPONSE)
    })

    it('should return normalised entity', () => {
      expect(result).to.deep.equal({
        id: 123,
        prop: 'value'
      })
    })
  })

  describe('when arango returns `null`', () => {
    it('should return `null`', () => {
      collectionStub.firstExample.returns(null)
      return expect(store.readOne({
        type: 'collectionName',
        filters: {
          test: 'value'
        }
      })).to.eventually.be.null()
    })
  })

  describe('when neither `id` or `filters` are given', () => {
    it('should return `null`', () => {
      return expect(store.readOne({
        type: 'collectionName'
      })).to.eventually.be.null()
    })
  })
})
