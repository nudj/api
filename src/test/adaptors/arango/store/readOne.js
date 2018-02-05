/* eslint-env mocha */

const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect

const Store = require('../../../../gql/adaptors/arango/store')

chai.use(sinonChai)

const DOCUMENT_RESPONSE = { _key: 'id', '_id': 123, '_rev': 123, prop: 'value' }

describe('ArangoAdaptor store.readOne', () => {
  let collectionStub
  let dbStub
  let store

  before(() => {
    collectionStub = {
      document: sinon.stub().returns(DOCUMENT_RESPONSE),
      firstExample: sinon.stub().returns(DOCUMENT_RESPONSE)
    }
    dbStub = {
      db: {
        collection: sinon.stub().returns(collectionStub)
      }
    }
    store = Store(dbStub)
  })
  afterEach(() => {
    collectionStub.document.reset()
    collectionStub.firstExample.reset()
    dbStub.db.collection.reset()
  })

  describe('by id', () => {
    it('should fetch the collection', () => {
      return store.readOne({
        type: 'collectionName',
        id: 123
      })
      .then(() => {
        expect(dbStub.db.collection).to.have.been.calledWith('collectionName')
      })
    })

    it('should read the data by id', () => {
      return store.readOne({
        type: 'collectionName',
        id: 123
      })
      .then(() => {
        const dataArgument = collectionStub.document.firstCall.args[0]
        expect(dataArgument).to.equal(123)
      })
    })

    it('should return normalised entity', () => {
      return expect(store.readOne({
        type: 'collectionName',
        id: 123
      })).to.eventually.deep.equal({
        id: 'id',
        prop: 'value'
      })
    })
  })

  describe('by filters', () => {
    it('should fetch the collection', async () => {
      await store.readOne({
        type: 'collectionName',
        filters: {
          test: 'value'
        }
      })
      .then(() => {
        expect(dbStub.db.collection).to.have.been.calledWith('collectionName')
      })
    })

    it('should read the data by filters', async () => {
      await store.readOne({
        type: 'collectionName',
        filters: {
          test: 'value'
        }
      })
      const dataArgument = collectionStub.firstExample.firstCall.args[0]
      return expect(dataArgument).to.deep.equal({
        test: 'value'
      })
    })

    it('should return normalised entity', () => {
      return expect(store.readOne({
        type: 'collectionName',
        filters: {
          test: 'value'
        }
      })).to.eventually.deep.equal({
        id: 'id',
        prop: 'value'
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
  })

  describe('when neither `id` or `filters` are given', () => {
    it('should return `null`', () => {
      return expect(store.readOne({
        type: 'collectionName'
      })).to.eventually.be.null()
    })
  })
})
