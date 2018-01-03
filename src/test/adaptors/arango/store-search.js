/* eslint-env mocha */

const chai = require('chai')
const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const dedent = require('dedent')
const expect = chai.expect

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

describe.only('ArangoAdaptor Store().search', () => {
  let Store
  let dbStub

  before(() => {
    dbStub = {
      db: {
        _query: sinon.stub().returns({ toArray: () => [DOCUMENT_RESPONSE] })
      },
      aql: aqlTemplateTag
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
        query: 'Pacman',
        fields: [
          ['title']
        ],
        filters: {
          creator: 'Namco'
        }
      })
      .then(() => {
        const [ query, bindVars ] = dbStub.db._query.firstCall.args
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
      return expect(Store().search({
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
      return Store().search({
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
        const [ query, bindVars ] = dbStub.db._query.firstCall.args
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
      return expect(Store().search({
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
      return Store().search({
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
        const [ query, bindVars ] = dbStub.db._query.firstCall.args
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
      return expect(Store().search({
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
