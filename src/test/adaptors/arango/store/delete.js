/* eslint-env mocha */

const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect

const Store = require('../../../../gql/adaptors/arango/store')

chai.use(sinonChai)

const OLD_RESPONSE = { old: { _key: 'id', '_id': 123, '_rev': 123, prop: 'value' } }

describe('ArangoAdaptor store.delete', () => {
  let collectionStub
  let dbStub
  let store

  before(() => {
    collectionStub = {
      remove: sinon.stub().returns(OLD_RESPONSE)
    }
    dbStub = {
      db: {
        collection: sinon.stub().returns(collectionStub)
      }
    }
    store = Store(dbStub)
  })
  afterEach(() => {
    dbStub.db.collection.reset()
    collectionStub.remove.reset()
  })

  it('should fetch the collection', () => {
    return store.delete({
      type: 'collectionName',
      id: 456
    })
    .then(() => {
      expect(dbStub.db.collection).to.have.been.calledWith('collectionName')
    })
  })

  it('should pass the entity id', () => {
    return store.delete({
      type: 'collectionName',
      id: 456
    })
    .then(() => {
      const id = collectionStub.remove.firstCall.args[0]
      expect(id).to.equal(456)
    })
  })

  it('should request deleted entity is returned', () => {
    return store.delete({
      type: 'collectionName',
      id: 456
    })
    .then(() => {
      const optionsArgument = collectionStub.remove.firstCall.args[1]
      expect(optionsArgument).to.have.property('returnOld', true)
    })
  })

  it('should return normalised entity', () => {
    return expect(store.delete({
      type: 'collectionName',
      id: 456
    })).to.eventually.deep.equal({
      id: 'id',
      prop: 'value'
    })
  })
})
