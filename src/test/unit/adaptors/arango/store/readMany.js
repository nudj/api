/* eslint-env mocha */

const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect

const Store = require('../../../../../gql/adaptors/arango/store')

chai.use(sinonChai)

const DOCUMENT_RESPONSE = { _key: 123, '_id': 'collectionNames/123', '_rev': 456, prop: 'value' }

xdescribe('ArangoAdaptor store.readMany', () => {
  let dbStub
  let store
  let dataLoaderStub
  let result

  before(() => {
    dataLoaderStub = {}
    dataLoaderStub.load = sinon.stub().returns(Promise.resolve(DOCUMENT_RESPONSE))
    dbStub = {
      getDataLoader: sinon.stub().returns(dataLoaderStub)
    }
    store = Store(dbStub)
  })
  beforeEach(async () => {
    result = await store.readMany({
      type: 'collectionName',
      ids: [1, 2]
    })
  })
  afterEach(() => {
    dbStub.getDataLoader.reset()
    dataLoaderStub.load.reset()
  })

  it('should fetch dataLoader for type', () => {
    expect(dbStub.getDataLoader).to.have.been.calledWith('collectionName')
  })

  it('should load the items by id using the dataloader', () => {
    expect(dataLoaderStub.load).to.have.been.calledWith(1)
    expect(dataLoaderStub.load).to.have.been.calledWith(2)
  })

  it('should return normalised entities', () => {
    return expect(result).to.deep.equal([{
      id: 123,
      prop: 'value'
    }, {
      id: 123,
      prop: 'value'
    }])
  })
})
