/* eslint-env mocha */

const chai = require('chai')
const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

const { setupDependencies, teardownDependencies } = require('../../../helpers/transactions')

const expect = chai.expect
chai.use(sinonChai)

const DOCUMENT_RESPONSE = { _key: 'id', '_id': 123, '_rev': 123, prop: 'value' }

describe('ArangoAdaptor StoreTransaction().readMany', () => {
  let Store
  let dbStub

  before(() => {
    setupDependencies()
    dbStub = {
      db: {
        collectionName: {
          document: sinon.stub().returns([DOCUMENT_RESPONSE, DOCUMENT_RESPONSE])
        }
      }
    }
    Store = proxyquire('../../../../../gql/adaptors/arango/store-transaction', {
      '@arangodb': dbStub,
      '@arangodb/crypto': {}
    })
  })
  afterEach(() => {
    dbStub.db.collectionName.document.reset()
  })
  after(() => {
    teardownDependencies()
  })

  it('should read the data by ids', () => {
    return Store().readMany({
      type: 'collectionName',
      ids: [1, 2]
    })
    .then(() => {
      const dataArgument = dbStub.db.collectionName.document.firstCall.args[0]
      expect(dataArgument).to.deep.equal([1, 2])
    })
  })

  it('should return normalised entities', () => {
    return expect(Store().readMany({
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
