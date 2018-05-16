/* eslint-env mocha */

const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const isDate = require('date-fns/is_valid')
const differenceInMinutes = require('date-fns/difference_in_minutes')
const expect = chai.expect

const Store = require('../../../../../gql/adaptors/arango/store')

chai.use(sinonChai)

const NEW_RESPONSE = { new: { _key: 'id', '_id': 123, '_rev': 123, prop: 'value' } }

xdescribe('ArangoAdaptor store.update', () => {
  let collectionStub
  let dbStub
  let store
  let dataLoaderStub

  before(() => {
    collectionStub = {
      update: sinon.stub().returns(NEW_RESPONSE)
    }
    dataLoaderStub = {}
    dataLoaderStub.prime = sinon.stub().returns(dataLoaderStub)
    dataLoaderStub.clear = sinon.stub().returns(dataLoaderStub)
    dbStub = {
      db: {
        collection: sinon.stub().returns(collectionStub)
      },
      getDataLoader: sinon.stub().returns(dataLoaderStub)
    }
    store = Store(dbStub)
  })
  afterEach(() => {
    collectionStub.update.reset()
    dbStub.db.collection.reset()
    dbStub.getDataLoader.reset()
    dataLoaderStub.prime.reset()
    dataLoaderStub.clear.reset()
  })

  it('should pass the entity id', () => {
    return store.update({
      type: 'collectionName',
      id: 456,
      data: {
        prop: 'value'
      }
    })
    .then(() => {
      const id = collectionStub.update.firstCall.args[0]
      expect(id).to.equal(456)
    })
  })

  it('should pass the patch data', () => {
    return store.update({
      type: 'collectionName',
      id: 456,
      data: {
        prop: 'value'
      }
    })
    .then(() => {
      const dataArgument = collectionStub.update.firstCall.args[1]
      expect(dataArgument).to.have.property('prop', 'value')
    })
  })

  it('should append modified date', () => {
    return store.update({
      type: 'collectionName',
      id: 456,
      data: {
        prop: 'value'
      }
    })
    .then(() => {
      const dataArgument = collectionStub.update.firstCall.args[1]
      expect(dataArgument).to.have.property('modified')
      expect(isDate(new Date(dataArgument.modified)), 'Modified is not date').to.be.true()
      expect(differenceInMinutes(new Date(dataArgument.modified), new Date()) < 1, 'Modified is not recent date').to.be.true()
    })
  })

  it('should request updated entity is returned', () => {
    return store.update({
      type: 'collectionName',
      id: 456,
      data: {
        prop: 'value'
      }
    })
    .then(() => {
      const optionsArgument = collectionStub.update.firstCall.args[2]
      expect(optionsArgument).to.have.property('returnNew', true)
    })
  })

  it('should fetch dataLoader for type', () => {
    return store.update({
      type: 'collectionName',
      id: 456,
      data: {
        prop: 'value'
      }
    })
    .then(() => expect(dbStub.getDataLoader).to.have.been.calledWith('collectionName'))
  })

  it('should clear the dataLoader cache', () => {
    return store.update({
      type: 'collectionName',
      id: 456,
      data: {
        prop: 'value'
      }
    })
    .then(() => expect(dataLoaderStub.clear).to.have.been.calledWith(456))
  })

  it('should prime the dataLoader cache', () => {
    return store.update({
      type: 'collectionName',
      id: 456,
      data: {
        prop: 'value'
      }
    })
    .then(() => expect(dataLoaderStub.prime).to.have.been.calledWith(456, {
      _key: 'id',
      _id: 123,
      _rev: 123,
      prop: 'value'
    }))
  })

  it('should return normalised entity', () => {
    return expect(store.update({
      type: 'collectionName',
      id: 456,
      data: {
        prop: 'value'
      }
    })).to.eventually.deep.equal({
      id: 'id',
      prop: 'value'
    })
  })
})
