/* eslint-env mocha */

const chai = require('chai')
const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect

chai.use(sinonChai)

const OLD_RESPONSE = { old: { _key: 'id', '_id': 123, '_rev': 123, prop: 'value' } }

describe('ArangoAdaptor Store().delete', () => {
  let Store
  let dbStub

  before(() => {
    dbStub = {
      db: {
        collectionName: {
          remove: sinon.stub().returns(OLD_RESPONSE)
        }
      }
    }
    Store = proxyquire('../../gql/arango-adaptor/store', {
      '@arangodb': dbStub
    })
  })
  afterEach(() => {
    dbStub.db.collectionName.remove.reset()
  })

  it('should pass the entity id', () => {
    return Store().delete({
      type: 'collectionName',
      id: 456
    })
    .then(() => {
      const id = dbStub.db.collectionName.remove.firstCall.args[0]
      expect(id).to.equal(456)
    })
  })

  it('should request deleted entity is returned', () => {
    return Store().delete({
      type: 'collectionName',
      id: 456
    })
    .then(() => {
      const optionsArgument = dbStub.db.collectionName.remove.firstCall.args[1]
      expect(optionsArgument).to.have.property('returnOld', true)
    })
  })

  it('should return normalised entity', () => {
    return expect(Store().delete({
      type: 'collectionName',
      id: 456
    })).to.eventually.deep.equal({
      id: 'id',
      prop: 'value'
    })
  })
})