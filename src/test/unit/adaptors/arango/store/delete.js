/* eslint-env mocha */

const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect

const Store = require('../../../../../gql/adaptors/arango/store')

chai.use(sinonChai)

const OLD_RESPONSE = { old: { _key: 123, '_id': 'collectionNames/123', '_rev': 456, prop: 'value' } }

describe('ArangoAdaptor store.delete', () => {
  let collectionStub
  let dbStub
  let store
  let dataLoaderStub
  let result

  before(() => {
    collectionStub = {
      remove: sinon.stub().returns(OLD_RESPONSE)
    }
    dataLoaderStub = {}
    dataLoaderStub.clear = sinon.stub().returns(dataLoaderStub)
    dbStub = {
      db: {
        collection: sinon.stub().returns(collectionStub)
      },
      getDataLoader: sinon.stub().returns(dataLoaderStub)
    }
    store = Store(dbStub)
  })
  beforeEach(async () => {
    result = await store.delete({
      type: 'collectionName',
      id: 123
    })
  })
  afterEach(() => {
    dbStub.db.collection.reset()
    collectionStub.remove.reset()
    dbStub.getDataLoader.reset()
    dataLoaderStub.clear.reset()
  })

  it('should fetch the collection', () => {
    expect(dbStub.db.collection).to.have.been.calledWith('collectionName')
  })

  it('should pass the entity id', () => {
    const id = collectionStub.remove.firstCall.args[0]
    expect(id).to.equal(123)
  })

  it('should request deleted entity is returned', () => {
    const optionsArgument = collectionStub.remove.firstCall.args[1]
    expect(optionsArgument).to.have.property('returnOld', true)
  })

  it('should fetch dataLoader for type', () => {
    expect(dbStub.getDataLoader).to.have.been.calledWith('collectionName')
  })

  it('should clear the dataLoader cache', () => {
    expect(dataLoaderStub.clear).to.have.been.calledWith(123)
  })

  it('should return normalised entity', () => {
    return expect(result).to.deep.equal({
      id: 123,
      prop: 'value'
    })
  })
})
