/* eslint-env mocha */

const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect

const Store = require('../../../../../gql/adaptors/arango/store')

chai.use(sinonChai)

const DOCUMENT_RESPONSE = { _key: 'id', '_id': 123, '_rev': 123, prop: 'value' }

describe('ArangoAdaptor store.readMany', () => {
  let collectionStub
  let dbStub
  let store

  before(() => {
    collectionStub = {
      lookupByKeys: sinon.stub().returns([DOCUMENT_RESPONSE, DOCUMENT_RESPONSE])
    }
    dbStub = {
      db: {
        collection: sinon.stub().returns(collectionStub)
      }
    }
    store = Store(dbStub)
  })
  afterEach(() => {
    collectionStub.lookupByKeys.reset()
    dbStub.db.collection.reset()
  })

  it('should fetch the collection', () => {
    return store.readMany({
      type: 'collectionName',
      ids: [1, 2]
    })
    .then(() => {
      expect(dbStub.db.collection).to.have.been.calledWith('collectionName')
    })
  })

  it('should read the data by ids', () => {
    return store.readMany({
      type: 'collectionName',
      ids: [1, 2]
    })
    .then(() => {
      const dataArgument = collectionStub.lookupByKeys.firstCall.args[0]
      expect(dataArgument).to.deep.equal([1, 2])
    })
  })

  it('should return normalised entities', () => {
    return expect(store.readMany({
      type: 'collectionName',
      ids: [1, 2]
    })).to.eventually.deep.equal([{
      id: 'id',
      prop: 'value'
    }, {
      id: 'id',
      prop: 'value'
    }])
  })
})
