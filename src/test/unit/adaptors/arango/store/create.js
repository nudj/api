/* eslint-env mocha */

const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const isDate = require('date-fns/is_valid')
const differenceInMinutes = require('date-fns/difference_in_minutes')
const expect = chai.expect

const Store = require('../../../../../gql/adaptors/arango/store')

chai.use(sinonChai)

const DOCUMENT_RESPONSE = { _key: 123, '_id': 'collectionNames/123', '_rev': 456, prop: 'value' }
const NEW_RESPONSE = { new: DOCUMENT_RESPONSE }

describe('ArangoAdaptor store.create', () => {
  let collectionStub
  let dbStub
  let store
  let dataLoaderStub
  let result

  before(() => {
    collectionStub = {
      save: sinon.stub().returns(NEW_RESPONSE)
    }
    dataLoaderStub = {}
    dataLoaderStub.prime = sinon.stub().returns(dataLoaderStub)
    dbStub = {
      db: {
        collection: sinon.stub().returns(collectionStub)
      },
      getDataLoader: sinon.stub().returns(dataLoaderStub)
    }
    store = Store(dbStub)
  })
  beforeEach(async () => {
    result = await store.create({
      type: 'collectionName',
      data: {
        prop: 'value'
      }
    })
  })
  afterEach(() => {
    dbStub.db.collection.reset()
    collectionStub.save.reset()
    dbStub.getDataLoader.reset()
    dataLoaderStub.prime.reset()
  })

  it('should fetch the collection', () => {
    expect(dbStub.db.collection).to.have.been.calledWith('collectionName')
  })

  it('should save the data', () => {
    const dataArgument = collectionStub.save.firstCall.args[0]
    expect(dataArgument).to.have.property('prop', 'value')
  })

  it('should append created date', () => {
    const dataArgument = collectionStub.save.firstCall.args[0]
    expect(dataArgument).to.have.property('created')
    expect(isDate(new Date(dataArgument.created)), 'Created is not date').to.be.true()
    expect(differenceInMinutes(new Date(dataArgument.created), new Date()) < 1, 'Created is not recent date').to.be.true()
  })

  it('should append modified date', () => {
    const dataArgument = collectionStub.save.firstCall.args[0]
    expect(dataArgument).to.have.property('modified')
    expect(isDate(new Date(dataArgument.modified)), 'Modified is not date').to.be.true()
    expect(differenceInMinutes(new Date(dataArgument.modified), new Date()) < 1, 'Modified is not recent date').to.be.true()
  })

  it('should request newly created entity is returned', () => {
    const optionsArgument = collectionStub.save.firstCall.args[1]
    expect(optionsArgument).to.have.property('returnNew', true)
  })

  it('should return normalised entity', () => {
    return expect(result).to.deep.equal({
      id: 123,
      prop: 'value'
    })
  })
})
