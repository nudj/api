/* eslint-env mocha */

const chai = require('chai')
const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const isDate = require('date-fns/is_valid')
const differenceInMinutes = require('date-fns/difference_in_minutes')

const { setupDependencies, teardownDependencies } = require('../../../helpers/transactions')

const expect = chai.expect
chai.use(sinonChai)

const NEW_RESPONSE = { new: { _key: 'id', '_id': 123, '_rev': 123, prop: 'value' } }

describe('ArangoAdaptor Store().update', () => {
  let Store
  let dbStub

  before(() => {
    setupDependencies()
    dbStub = {
      db: {
        collectionName: {
          update: sinon.stub().returns(NEW_RESPONSE)
        }
      }
    }
    Store = proxyquire('../../../../../gql/adaptors/arango/store-transaction', {
      '@arangodb': dbStub,
      '@arangodb/crypto': {}
    })
  })
  afterEach(() => {
    dbStub.db.collectionName.update.reset()
  })
  after(() => {
    teardownDependencies()
  })

  it('should pass the entity id', () => {
    return Store().update({
      type: 'collectionName',
      id: 456,
      data: {
        prop: 'value'
      }
    })
    .then(() => {
      const id = dbStub.db.collectionName.update.firstCall.args[0]
      expect(id).to.equal(456)
    })
  })

  it('should pass the patch data', () => {
    return Store().update({
      type: 'collectionName',
      id: 456,
      data: {
        prop: 'value'
      }
    })
    .then(() => {
      const dataArgument = dbStub.db.collectionName.update.firstCall.args[1]
      expect(dataArgument).to.have.property('prop', 'value')
    })
  })

  it('should append modified date', () => {
    return Store().update({
      type: 'collectionName',
      id: 456,
      data: {
        prop: 'value'
      }
    })
    .then(() => {
      const dataArgument = dbStub.db.collectionName.update.firstCall.args[1]
      expect(dataArgument).to.have.property('modified')
      expect(isDate(new Date(dataArgument.modified)), 'Modified is not date').to.be.true()
      expect(differenceInMinutes(new Date(dataArgument.modified), new Date()) < 1, 'Modified is not recent date').to.be.true()
    })
  })

  it('should request updated entity is returned', () => {
    return Store().update({
      type: 'collectionName',
      id: 456,
      data: {
        prop: 'value'
      }
    })
    .then(() => {
      const optionsArgument = dbStub.db.collectionName.update.firstCall.args[2]
      expect(optionsArgument).to.have.property('returnNew', true)
    })
  })

  it('should return normalised entity', () => {
    return expect(Store().update({
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
