/* eslint-env mocha */

const chai = require('chai')
const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

const { setupDependencies, teardownDependencies } = require('../../../helpers/transactions')

const expect = chai.expect
chai.use(sinonChai)

const DOCUMENT_RESPONSE = { _key: 'id', '_id': 123, '_rev': 123, prop: 'value' }

describe('ArangoAdaptor Store().readOne', () => {
  let Store
  let dbStub

  before(() => {
    setupDependencies()
    dbStub = {
      db: {
        collectionName: {
          document: sinon.stub().returns(DOCUMENT_RESPONSE),
          firstExample: sinon.stub().returns(DOCUMENT_RESPONSE)
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
    dbStub.db.collectionName.firstExample.reset()
  })
  after(() => {
    teardownDependencies()
  })

  describe('by id', () => {
    it('should read the data by id', () => {
      return Store().readOne({
        type: 'collectionName',
        id: 123
      })
      .then(() => {
        const dataArgument = dbStub.db.collectionName.document.firstCall.args[0]
        expect(dataArgument).to.equal(123)
      })
    })

    it('should return normalised entity', () => {
      return expect(Store().readOne({
        type: 'collectionName',
        id: 123
      })).to.eventually.deep.equal({
        id: 'id',
        prop: 'value'
      })
    })
  })

  describe('by filters', () => {
    it('should read the data by filters', async () => {
      await Store().readOne({
        type: 'collectionName',
        filters: {
          test: 'value'
        }
      })
      const dataArgument = dbStub.db.collectionName.firstExample.firstCall.args[0]
      return expect(dataArgument).to.deep.equal({
        test: 'value'
      })
    })

    it('should return normalised entity', () => {
      return expect(Store().readOne({
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
        dbStub.db.collectionName.firstExample.returns(null)
        return expect(Store().readOne({
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
      return expect(Store().readOne({
        type: 'collectionName'
      })).to.eventually.be.null()
    })
  })
})
