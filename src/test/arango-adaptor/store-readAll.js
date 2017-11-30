/* eslint-env mocha */

const chai = require('chai')
const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect

chai.use(sinonChai)

const DOCUMENT_RESPONSE = { _key: 'id', '_id': 123, '_rev': 123, prop: 'value' }

describe('ArangoAdaptor Store().readAll', () => {
  let Store
  let dbStub

  before(() => {
    dbStub = {
      db: {
        collectionName: {
          all: sinon.stub().returns({ toArray: () => [DOCUMENT_RESPONSE, DOCUMENT_RESPONSE] }),
          byExample: sinon.stub().returns({ toArray: () => [DOCUMENT_RESPONSE, DOCUMENT_RESPONSE] })
        }
      }
    }
    Store = proxyquire('../../gql/arango-adaptor/store', {
      '@arangodb': dbStub
    })
  })
  afterEach(() => {
    dbStub.db.collectionName.all.reset()
    dbStub.db.collectionName.byExample.reset()
  })

  describe('with no filters', () => {
    it('should fetch the data', () => {
      return Store().readAll({
        type: 'collectionName'
      })
      .then(() => {
        expect(dbStub.db.collectionName.all).to.have.been.called()
      })
    })

    it('should return normalised entities', () => {
      return expect(Store().readAll({
        type: 'collectionName'
      })).to.eventually.deep.equal([{
        id: 'id',
        prop: 'value'
      }, {
        id: 'id',
        prop: 'value'
      }])
    })
  })

  describe('with filters', () => {
    it('should fetch the data', () => {
      return Store().readAll({
        type: 'collectionName',
        filters: {
          test: 'value'
        }
      })
      .then(() => {
        const dataArgument = dbStub.db.collectionName.byExample.firstCall.args[0]
        expect(dataArgument).to.deep.equal({
          test: 'value'
        })
      })
    })

    it('should return normalised entities', () => {
      return expect(Store().readAll({
        type: 'collectionName',
        filters: {
          test: 'value'
        }
      })).to.eventually.deep.equal([{
        id: 'id',
        prop: 'value'
      }, {
        id: 'id',
        prop: 'value'
      }])
    })
  })
})
