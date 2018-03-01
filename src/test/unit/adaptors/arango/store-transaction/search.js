/* eslint-env mocha */

const chai = require('chai')
const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
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

describe('ArangoAdaptor Store().search', () => {
  let Store
  let dbStub

  before(() => {
    dbStub = {
      db: {
        _query: sinon.stub().returns({ toArray: () => [DOCUMENT_RESPONSE] })
      }
    }
    Store = proxyquire('../../../../../gql/adaptors/arango/store-transaction', {
      '@arangodb': dbStub
    })
  })
  afterEach(() => {
    dbStub.db._query.reset()
  })

  it('should throw an error', () => {
    return expect(() => Store().search({
      type: 'videoGames',
      query: 'Pacman',
      fields: [
        ['title']
      ],
      filters: {
        creator: 'Namco'
      }
    }))
    .to.throw(Error, 'Search cannot be performed as a transaction')
  })
})