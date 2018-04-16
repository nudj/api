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
const FILTER_NO_MATCH = null

describe('ArangoAdaptor store.readOneOrCreate', () => {
  let collectionStub
  let dbStub
  let store
  let dataLoaderStub

  before(() => {
    collectionStub = {
      save: sinon.stub().returns(NEW_RESPONSE),
      firstExample: sinon.stub().returns(DOCUMENT_RESPONSE)
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
    collectionStub.save.reset()
    collectionStub.firstExample.reset()
    dbStub.db.collection.reset()
    dbStub.getDataLoader.reset()
    dataLoaderStub.prime.reset()
    dataLoaderStub.clear.reset()
  })

  describe('if filter finds a match', () => {
    it('checks for existing', () => {
      return store.readOneOrCreate({
        type: 'collectionName',
        filters: {
          test: 'value'
        },
        data: {
          key: 'value'
        }
      })
      .then(() => {
        const dataArgument = collectionStub.firstExample.firstCall.args[0]
        expect(dataArgument).to.have.property('test', 'value')
        expect(collectionStub.save).to.not.have.been.called()
      })
    })

    it('should return existing entity', () => {
      return expect(store.readOneOrCreate({
        type: 'collectionName',
        filters: {
          test: 'value'
        },
        data: {
          key: 'value'
        }
      })).to.eventually.deep.equal({
        id: 123,
        prop: 'value'
      })
    })
  })

  describe('if filter matches nothing', () => {
    let result

    beforeEach(async () => {
      collectionStub.firstExample.returns(FILTER_NO_MATCH)
      result = await store.readOneOrCreate({
        type: 'collectionName',
        filters: {
          test: 'value'
        },
        data: {
          prop: 'value'
        }
      })
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

    it('should fetch dataLoader for type', () => {
      expect(dbStub.getDataLoader).to.have.been.calledWith('collectionName')
    })

    it('should clear the dataLoader cache', () => {
      expect(dataLoaderStub.clear).to.have.been.calledWith(123)
    })

    it('should prime the dataLoader cache', () => {
      expect(dataLoaderStub.prime).to.have.been.calledWith(123, DOCUMENT_RESPONSE)
    })

    it('should return normalised entity', () => {
      return expect(result).to.deep.equal({
        id: 123,
        prop: 'value'
      })
    })
  })
})
