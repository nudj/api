/* eslint-env mocha */

const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const isDate = require('date-fns/is_valid')
const differenceInMinutes = require('date-fns/difference_in_minutes')
const expect = chai.expect

const Store = require('../../../../gql/adaptors/arango/store')

chai.use(sinonChai)

const DOCUMENT_RESPONSE = { _key: 'id', '_id': 123, '_rev': 123, prop: 'value' }
const NEW_RESPONSE = { new: { _key: 'id', '_id': 123, '_rev': 123, prop: 'value' } }
const FILTER_NO_MATCH = null

describe('ArangoAdaptor store.readOneOrCreate', () => {
  let collectionStub
  let dbStub
  let store

  before(() => {
    collectionStub = {
      save: sinon.stub().returns(NEW_RESPONSE),
      firstExample: sinon.stub().returns(DOCUMENT_RESPONSE)
    }
    dbStub = {
      db: {
        collection: sinon.stub().returns(collectionStub)
      }
    }
    store = Store(dbStub)
  })
  afterEach(() => {
    collectionStub.save.reset()
    collectionStub.firstExample.reset()
    dbStub.db.collection.reset()
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
        id: 'id',
        prop: 'value'
      })
    })
  })

  describe('if filter matches nothing', () => {
    beforeEach(() => {
      collectionStub.firstExample.returns(FILTER_NO_MATCH)
    })

    it('should save the data', () => {
      return store.readOneOrCreate({
        type: 'collectionName',
        filters: {
          test: 'value'
        },
        data: {
          prop: 'value'
        }
      })
      .then(() => {
        const dataArgument = collectionStub.save.firstCall.args[0]
        expect(dataArgument).to.have.property('prop', 'value')
      })
    })

    it('should append created date', () => {
      return store.readOneOrCreate({
        type: 'collectionName',
        filters: {
          test: 'value'
        },
        data: {
          prop: 'value'
        }
      })
      .then(() => {
        const dataArgument = collectionStub.save.firstCall.args[0]
        expect(dataArgument).to.have.property('created')
        expect(isDate(new Date(dataArgument.created)), 'Created is not date').to.be.true()
        expect(differenceInMinutes(new Date(dataArgument.created), new Date()) < 1, 'Created is not recent date').to.be.true()
      })
    })

    it('should append modified date', () => {
      return store.readOneOrCreate({
        type: 'collectionName',
        filters: {
          test: 'value'
        },
        data: {
          prop: 'value'
        }
      })
      .then(() => {
        const dataArgument = collectionStub.save.firstCall.args[0]
        expect(dataArgument).to.have.property('modified')
        expect(isDate(new Date(dataArgument.modified)), 'Modified is not date').to.be.true()
        expect(differenceInMinutes(new Date(dataArgument.modified), new Date()) < 1, 'Modified is not recent date').to.be.true()
      })
    })

    it('should request newly created entity is returned', () => {
      return store.readOneOrCreate({
        type: 'collectionName',
        filters: {
          test: 'value'
        },
        data: {
          prop: 'value'
        }
      })
      .then(() => {
        const optionsArgument = collectionStub.save.firstCall.args[1]
        expect(optionsArgument).to.have.property('returnNew', true)
      })
    })

    it('should return normalised entity', () => {
      return expect(store.readOneOrCreate({
        type: 'collectionName',
        filters: {
          test: 'value'
        },
        data: {
          prop: 'value'
        }
      })).to.eventually.deep.equal({
        id: 'id',
        prop: 'value'
      })
    })
  })
})
