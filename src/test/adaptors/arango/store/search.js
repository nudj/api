/* eslint-env mocha */

const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect

const Store = require('../../../../gql/adaptors/arango/store')

chai.use(sinonChai)

const DOCUMENT_RESPONSE = {
  _key: 'id',
  '_id': 123,
  '_rev': 123,
  title: 'Pacman',
  creator: 'Namco',
  genre: 'Arcade'
}

describe('ArangoAdaptor store.search', () => {
  let dbStub
  let store

  before(() => {
    dbStub = {
      db: {
        query: sinon.stub().returns({ all: () => [DOCUMENT_RESPONSE] })
      }
    }
    store = Store(dbStub)
  })
  afterEach(() => {
    dbStub.db.query.reset()
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
        expect(bindVars).to.deep.equal({ query0: 'Pacman' })
        expect(query).to.be.a('string')
      })
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
          id: 'id',
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
        expect(bindVars).to.deep.equal({ query0: 'Pacman' })
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
          id: 'id',
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
          id: 'id',
          title: 'Pacman',
          creator: 'Namco',
          genre: 'Arcade'
        }
      ])
    })
  })
})
