/* eslint-env mocha */

const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const dedent = require('dedent')
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

const aqlTemplateTag = (strings, operations) =>
  strings[0] + operations + strings[1]

describe('ArangoAdaptor store.search', () => {
  let dbStub
  let store

  before(() => {
    dbStub = {
      db: {
        query: sinon.stub().returns({ all: () => [DOCUMENT_RESPONSE] })
      },
      aql: aqlTemplateTag
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
        expect(bindVars).to.deep.equal({ query: 'Pacman' })
        expect(dedent(query)).to.equal(dedent`
          RETURN UNION_DISTINCT([],
            (
              FOR item IN videoGames
                FILTER item.creator == "Namco"
                FILTER(
                  CONTAINS(
                    LOWER(CONCAT_SEPARATOR(" ", item.title)), LOWER(@query)
                  )
                )
                RETURN item
            )
          )
        `
      )
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
        expect(bindVars).to.deep.equal({ query: 'Pacman' })
        expect(dedent(query)).to.equal(dedent`
          RETURN UNION_DISTINCT([],
            (
              FOR item IN videoGames
                FILTER item.creator == "Namco"
                FILTER(
                  CONTAINS(
                    LOWER(CONCAT_SEPARATOR(" ", item.title)), LOWER(@query)
                  )
                )
                RETURN item
            )
          ,
            (
              FOR item IN videoGames
                FILTER item.creator == "Namco"
                FILTER(
                  CONTAINS(
                    LOWER(CONCAT_SEPARATOR(" ", item.franchise)), LOWER(@query)
                  )
                )
                RETURN item
            )
          )
        `
      )
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
        expect(bindVars).to.deep.equal({ query: 'Pacman Arcade' })
        expect(dedent(query)).to.equal(dedent`
          RETURN UNION_DISTINCT([],
            (
              FOR item IN videoGames
                FILTER item.creator == "Namco" && item.genre == "Arcade"
                FILTER(
                  CONTAINS(
                    LOWER(CONCAT_SEPARATOR(" ", item.title,item.genre)), LOWER(@query)
                  )
                )
                RETURN item
            )
          ,
            (
              FOR item IN videoGames
                FILTER item.creator == "Namco" && item.genre == "Arcade"
                FILTER(
                  CONTAINS(
                    LOWER(CONCAT_SEPARATOR(" ", item.franchise)), LOWER(@query)
                  )
                )
                RETURN item
            )
          )
        `
      )
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
