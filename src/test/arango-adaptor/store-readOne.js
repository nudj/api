/* eslint-env mocha */

const chai = require('chai')
const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect

chai.use(sinonChai)

const DOCUMENT_RESPONSE = { _key: 'id', '_id': 123, '_rev': 123, prop: 'value' }

describe('ArangoAdaptor Store().readOne', () => {
  let Store
  let dbStub

  before(() => {
    dbStub = {
      db: {
        collectionName: {
          document: sinon.stub().returns(DOCUMENT_RESPONSE),
          firstExample: sinon.stub().returns(DOCUMENT_RESPONSE)
        }
      }
    }
    Store = proxyquire('../../gql/arango-adaptor/store', {
      '@arangodb': dbStub
    })
  })
  afterEach(() => {
    dbStub.db.collectionName.document.reset()
    dbStub.db.collectionName.firstExample.reset()
  })

  describe('by id', () => {
    it('should read the data by id', () => {
      Store().readOne({
        type: 'collectionName',
        id: 123
      })
      const dataArgument = dbStub.db.collectionName.document.firstCall.args[0]
      expect(dataArgument).to.equal(123)
    })

    it('should return normalised entity', () => {
      expect(Store().readOne({
        type: 'collectionName',
        id: 123
      })).to.deep.equal({
        id: 'id',
        prop: 'value'
      })
    })
  })

  describe('by filters', () => {
    it('should read the data by filters', () => {
      Store().readOne({
        type: 'collectionName',
        filters: {
          test: 'value'
        }
      })
      const dataArgument = dbStub.db.collectionName.firstExample.firstCall.args[0]
      expect(dataArgument).to.deep.equal({
        test: 'value'
      })
    })

    it('should return normalised entity', () => {
      expect(Store().readOne({
        type: 'collectionName',
        filters: {
          test: 'value'
        }
      })).to.deep.equal({
        id: 'id',
        prop: 'value'
      })
    })
  })
})
