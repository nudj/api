/* eslint-env mocha */

const chai = require('chai')
const dedent = require('dedent')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect

const Store = require('../../../../../gql/adaptors/arango/store')

chai.use(sinonChai)

const DOCUMENT_RESPONSE_1 = {
  _key: 123,
  '_id': 'collectionName/123',
  '_rev': 456,
  prop: 'value1'
}
const DOCUMENT_RESPONSE_2 = {
  _key: 234,
  '_id': 'collectionName/123',
  '_rev': 567,
  prop: 'value2'
}

xdescribe('ArangoAdaptor store.readAll', () => {
  let collectionStub
  let dbStub
  let store
  let dataLoaderStub

  before(() => {
    collectionStub = {
      all: sinon.stub().returns({ all: () => [DOCUMENT_RESPONSE_1, DOCUMENT_RESPONSE_2] }),
      byExample: sinon.stub().returns({ all: () => [DOCUMENT_RESPONSE_1] })
    }
    dataLoaderStub = {}
    dataLoaderStub.prime = sinon.stub().returns(dataLoaderStub)
    dbStub = {
      db: {
        query: sinon.stub().returns({ all: () => [DOCUMENT_RESPONSE_1] }),
        collection: sinon.stub().returns(collectionStub)
      },
      getDataLoader: sinon.stub().returns(dataLoaderStub)
    }
    store = Store(dbStub)
  })
  afterEach(() => {
    dbStub.db.query.reset()
    collectionStub.all.reset()
    collectionStub.byExample.reset()
    dbStub.getDataLoader.reset()
    dataLoaderStub.prime.reset()
  })

  it('should fetch the collection', () => {
    return store.readAll({
      type: 'collectionName'
    })
    .then(() => {
      expect(dbStub.db.collection).to.have.been.calledWith('collectionName')
    })
  })

  describe('with no filters', () => {
    let result

    beforeEach(async () => {
      result = await store.readAll({
        type: 'collectionName'
      })
    })

    it('should fetch the data', () => {
      expect(collectionStub.all).to.have.been.called()
    })

    it('should prime the dataLoader cache', () => {
      expect(dataLoaderStub.prime).to.have.been.calledWith(123, DOCUMENT_RESPONSE_1)
      expect(dataLoaderStub.prime).to.have.been.calledWith(234, DOCUMENT_RESPONSE_2)
    })

    it('should return normalised entities', () => {
      return expect(result).to.deep.equal([{
        id: 123,
        prop: 'value1'
      }, {
        id: 234,
        prop: 'value2'
      }])
    })
  })

  describe('with filters', () => {
    let result

    beforeEach(async () => {
      result = await store.readAll({
        type: 'collectionName',
        filters: {
          test: 'value1'
        }
      })
    })

    it('should fetch the data', () => {
      const dataArgument = collectionStub.byExample.firstCall.args[0]
      expect(dataArgument).to.deep.equal({
        test: 'value1'
      })
    })

    it('should prime the dataLoader cache', () => {
      expect(dataLoaderStub.prime).to.have.been.calledWith(123, DOCUMENT_RESPONSE_1)
    })

    it('should return normalised entities', () => {
      return expect(result).to.deep.equal([{
        id: 123,
        prop: 'value1'
      }])
    })
  })

  describe('with date filters', () => {
    it('should fetch the data with \'to\' and \'from\' dates', () => {
      return store.readAll({
        type: 'collectionName',
        filters: {
          dateTo: '2017-12-15T11:21:51.030+00:00',
          dateFrom: '2016-12-15T11:21:51.030+00:00'
        }
      })
      .then(() => {
        const [ query, bindVars ] = dbStub.db.query.firstCall.args
        expect(bindVars).to.deep.equal({
          from: '2016-12-15T23:59:59.999Z',
          to: '2017-12-15T23:59:59.999Z'
        })
        expect(dedent(query)).to.equal(dedent`
          FOR item in collectionName
          FILTER DATE_TIMESTAMP(item.created) <= DATE_TIMESTAMP(@to)
          FILTER DATE_TIMESTAMP(item.created) >= DATE_TIMESTAMP(@from)
          RETURN item
        `)
      })
    })

    it('should fetch the data with \'to\' date', () => {
      return store.readAll({
        type: 'collectionName',
        filters: {
          dateTo: '2017-12-15T11:21:51.030+00:00'
        }
      })
      .then(() => {
        const [ query, bindVars ] = dbStub.db.query.firstCall.args
        expect(bindVars.to).to.equal('2017-12-15T23:59:59.999Z')
        expect(bindVars.from).to.be.undefined()
        expect(dedent(query)).to.equal(dedent`
          FOR item in collectionName
          FILTER DATE_TIMESTAMP(item.created) <= DATE_TIMESTAMP(@to)
          RETURN item
        `)
      })
    })

    it('should fetch the data with \'from\' date', () => {
      return store.readAll({
        type: 'collectionName',
        filters: {
          dateFrom: '2017-12-19T11:21:51.030+00:00'
        }
      })
      .then(() => {
        const [ query, bindVars ] = dbStub.db.query.firstCall.args
        expect(bindVars.from).to.equal('2017-12-19T23:59:59.999Z')
        expect(bindVars.to).to.be.undefined()
        expect(dedent(query)).to.equal(dedent`
          FOR item in collectionName
          FILTER DATE_TIMESTAMP(item.created) >= DATE_TIMESTAMP(@from)
          RETURN item
        `)
      })
    })

    it('should fetch the data with date and regular filters', () => {
      return store.readAll({
        type: 'collectionName',
        filters: {
          email: 'test@email.com',
          address: '1 Test Drive',
          dateFrom: '2010-12-19T11:21:51.030+00:00'
        }
      })
      .then(() => {
        const [ query, bindVars ] = dbStub.db.query.firstCall.args
        expect(bindVars.from).to.equal('2010-12-19T23:59:59.999Z')
        expect(dedent(query)).to.equal(dedent`
          FOR item in collectionName
          FILTER item.email == "test@email.com" && item.address == "1 Test Drive"
          FILTER DATE_TIMESTAMP(item.created) >= DATE_TIMESTAMP(@from)
          RETURN item
        `)
      })
    })

    it('should prime the dataLoader cache', () => {
      return store.readAll({
        type: 'collectionName',
        filters: {
          dateTo: '2017-12-15T11:21:51.030+00:00',
          dateFrom: '2016-12-15T11:21:51.030+00:00'
        }
      })
      .then(() => {
        expect(dataLoaderStub.prime).to.have.been.calledWith(123, DOCUMENT_RESPONSE_1)
      })
    })

    it('should return normalised entities', () => {
      return expect(store.readAll({
        type: 'collectionName',
        filters: {
          dateTo: '2017-12-15T11:21:51.030+00:00',
          dateFrom: '2016-12-15T11:21:51.030+00:00'
        }
      })).to.eventually.deep.equal([
        {
          id: 123,
          prop: 'value1'
        }
      ])
    })
  })
})
