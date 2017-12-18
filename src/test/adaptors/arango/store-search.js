/* eslint-env mocha */

const chai = require('chai')
const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect

chai.use(sinonChai)

const DOCUMENT_RESPONSE = { _key: 'id', '_id': 123, '_rev': 123, title: 'halo 1' }

describe('ArangoAdaptor Store().search', () => {
  let Store
  let dbStub

  before(() => {
    dbStub = {
      db: {
        _query: sinon.stub().returns({ toArray: () => [DOCUMENT_RESPONSE, DOCUMENT_RESPONSE] })
      }
    }
    Store = proxyquire('../../../gql/adaptors/arango/store', {
      '@arangodb': dbStub
    })
  })
  afterEach(() => {
    dbStub.db._query.reset()
  })

  describe('with one search field', () => {
    it('should fetch the data', () => {
      return Store().search({
        type: 'videoGames',
        query: 'halo',
        fields: ['title']
      })
      .then(() => {
        expect(dbStub.db._query).to.have.been.calledWith(
          `RETURN UNION_DISTINCT(
          (
            FOR item IN videoGames
                FILTER CONTAINS(LOWER(item.title), LOWER("halo"))
                RETURN item
          )
        )`
      )
      })
    })

    it('should return normalised values', () => {
      return expect(Store().search({
        type: 'videoGames',
        query: 'halo',
        fields: ['title']
      })).to.eventually.deep.equal([
        {
          id: 'id',
          title: 'halo 1'
        },
        {
          id: 'id',
          title: 'halo 1'
        }
      ])
    })
  })

  describe('with multiple search fields', () => {
    it('should fetch the data', () => {
      return Store().search({
        type: 'videoGames',
        query: 'halo',
        fields: ['title', 'franchise']
      })
      .then(() => {
        expect(dbStub.db._query).to.have.been.calledWith(
          `RETURN UNION_DISTINCT(
          (
            FOR item IN videoGames
                FILTER CONTAINS(LOWER(item.title), LOWER("halo"))
                RETURN item
          )
        ,
          (
            FOR item IN videoGames
                FILTER CONTAINS(LOWER(item.franchise), LOWER("halo"))
                RETURN item
          )
        )`
      )
      })
    })

    it('should return normalised values', () => {
      return expect(Store().search({
        type: 'videoGames',
        query: 'halo',
        fields: ['title', 'franchise']
      })).to.eventually.deep.equal([
        {
          id: 'id',
          title: 'halo 1'
        },
        {
          id: 'id',
          title: 'halo 1'
        }
      ])
    })
  })

  describe('with a spaced query', () => {
    it('should fetch the data', () => {
      return Store().search({
        type: 'videoGames',
        query: 'halo game',
        fields: ['title', 'franchise']
      })
      .then(() => {
        expect(dbStub.db._query).to.have.been.calledWith(
          `RETURN UNION_DISTINCT(
          (
            FOR item IN videoGames
                FILTER CONTAINS(LOWER(item.title), LOWER("halo"))
                RETURN item
          )
        ,
          (
            FOR item IN videoGames
                FILTER CONTAINS(LOWER(item.franchise), LOWER("halo"))
                RETURN item
          )
        ,
          (
            FOR item IN videoGames
                FILTER CONTAINS(LOWER(item.title), LOWER("game"))
                RETURN item
          )
        ,
          (
            FOR item IN videoGames
                FILTER CONTAINS(LOWER(item.franchise), LOWER("game"))
                RETURN item
          )
        )`
      )
      })
    })

    it('should return normalised values', () => {
      return expect(Store().search({
        type: 'videoGames',
        query: 'halo game',
        fields: ['title', 'franchise']
      })).to.eventually.deep.equal([
        {
          id: 'id',
          title: 'halo 1'
        },
        {
          id: 'id',
          title: 'halo 1'
        }
      ])
    })
  })
})
