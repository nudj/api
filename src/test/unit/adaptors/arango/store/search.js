/* eslint-env mocha */

const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect

const Store = require('../../../../../gql/adaptors/arango/store')

chai.use(sinonChai)

const DOCUMENT_RESPONSE = {
  _key: '123',
  _id: 'videoGames/123',
  _rev: '456',
  title: 'Pacman',
  creator: 'Namco',
  genre: 'Arcade'
}

xdescribe('ArangoAdaptor store.search', () => {
  let dbStub
  let store
  let dataLoaderStub

  before(() => {
    dataLoaderStub = {}
    dataLoaderStub.prime = sinon.stub().returns(dataLoaderStub)
    dbStub = {
      db: {
        query: sinon.stub().returns({ all: () => [DOCUMENT_RESPONSE] })
      },
      getDataLoader: sinon.stub().returns(dataLoaderStub)
    }
    store = Store(dbStub)
  })
  afterEach(() => {
    dbStub.db.query.reset()
    dbStub.getDataLoader.reset()
    dataLoaderStub.prime.reset()
  })

  describe('with one search field', () => {
    it('should fetch the data', () => {
      return store.search({
        type: 'videoGames',
        query: 'Pacman',
        fields: [
          ['title']
        ],
        filters: {
          creator: 'Namco'
        }
      })
      .then(() => {
        const [ query, bindVars ] = dbStub.db.query.firstCall.args
        expect(bindVars).to.deep.equal({
          creator: 'Namco',
          query0: 'Pacman'
        })
        expect(query).to.be.a('string')
      })
    })

    it('should fetch dataLoader for type', () => {
      return store.search({
        type: 'videoGames',
        query: 'Pacman',
        fields: [
          ['title']
        ],
        filters: {
          creator: 'Namco'
        }
      })
      .then(() => expect(dbStub.getDataLoader).to.have.been.calledWith('videoGames'))
    })

    it('should prime the dataLoader cache', () => {
      return store.search({
        type: 'videoGames',
        query: 'Pacman',
        fields: [
          ['title']
        ],
        filters: {
          creator: 'Namco'
        }
      })
      .then(() => expect(dataLoaderStub.prime).to.have.been.calledWith('123', DOCUMENT_RESPONSE))
    })

    it('should return normalised values', () => {
      return expect(store.search({
        type: 'videoGames',
        query: 'Pacman',
        fields: [
          ['title']
        ]
      })).to.eventually.deep.equal([
        {
          id: '123',
          title: 'Pacman',
          creator: 'Namco',
          genre: 'Arcade'
        }
      ])
    })
  })

  describe('with multiple search fields', () => {
    it('should fetch the data', () => {
      return store.search({
        type: 'videoGames',
        query: 'Pacman',
        fields: [
          ['title'],
          ['franchise']
        ],
        filters: {
          creator: 'Namco'
        }
      })
      .then(() => {
        const [ query, bindVars ] = dbStub.db.query.firstCall.args
        expect(bindVars).to.deep.equal({
          creator: 'Namco',
          query0: 'Pacman'
        })
        expect(query).to.be.a('string')
      })
    })

    it('should return normalised values', () => {
      return expect(store.search({
        type: 'videoGames',
        query: 'Pacman',
        fields: [
          ['title'],
          ['franchise']
        ]
      })).to.eventually.deep.equal([
        {
          id: '123',
          title: 'Pacman',
          creator: 'Namco',
          genre: 'Arcade'
        }
      ])
    })
  })

  describe('with combined fields', () => {
    it('should fetch the data', () => {
      return store.search({
        type: 'videoGames',
        query: 'Pacman Arcade',
        fields: [
          ['title', 'genre'],
          ['franchise']
        ],
        filters: {
          creator: 'Namco',
          genre: 'Arcade'
        }
      })
      .then(() => {
        const [ query, bindVars ] = dbStub.db.query.firstCall.args
        expect(bindVars).to.deep.equal({
          creator: 'Namco',
          genre: 'Arcade',
          query0: 'Pacman Arcade',
          query1: 'Pacman',
          query2: 'Arcade'
        })
        expect(query).to.be.a('string')
      })
    })

    it('should return normalised values', () => {
      return expect(store.search({
        type: 'videoGames',
        query: 'Pacman Arcade',
        fields: [['title'], ['franchise']]
      })).to.eventually.deep.equal([
        {
          id: '123',
          title: 'Pacman',
          creator: 'Namco',
          genre: 'Arcade'
        }
      ])
    })
  })
})
