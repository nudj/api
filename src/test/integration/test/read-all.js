/* eslint-env mocha */
const orderBy = require('lodash/orderBy')
const {
  db,
  setupCollections,
  teardownCollections,
  truncateCollections,
  populateCollections,
  expect
} = require('../lib')

const Store = require('../../../gql/adaptors/arango/store')

const collectionName = 'tvSeries'

const resetDataStore = async () => populateCollections(db, [
  {
    name: collectionName,
    data: [
      {
        created: '2016-12-12 13:04:11',
        name: 'The Walking Dead',
        genre: 'action'
      },
      {
        created: '2016-12-14 13:04:11',
        name: 'West Wing',
        genre: 'drama'
      },
      {
        created: '2016-12-18 13:04:11',
        name: 'Black Mirror',
        genre: 'sci-fi horror'
      },
      {
        created: '2016-12-19 13:04:11',
        name: 'Game of Thrones',
        genre: 'action'
      },
      {
        created: '2016-12-20 13:04:11',
        name: 'Daredevil',
        genre: 'action'
      }
    ]
  }
])

describe('readAll', () => {
  let store
  before(async () => {
    await setupCollections(db, [collectionName])
  })

  beforeEach(async () => {
    await resetDataStore()
    store = Store({ db })
  })

  after(async () => {
    await teardownCollections(db, [collectionName])
  })

  afterEach(async () => {
    await truncateCollections(db, [collectionName])
  })

  describe('with no filters', () => {
    it('returns all normalised results', async () => {
      const response = await store.readAll({
        type: collectionName
      })
      const results = orderBy(response, ['name'])
      expect(results[0]).to.have.property('name').to.equal('Black Mirror')
      expect(results[0]).to.have.property('genre').to.equal('sci-fi horror')
      expect(results[0]).to.have.property('id').to.be.a('string')

      expect(results[1]).to.have.property('name').to.equal('Daredevil')
      expect(results[1]).to.have.property('genre').to.equal('action')
      expect(results[1]).to.have.property('id').to.be.a('string')

      expect(results[2]).to.have.property('name').to.equal('Game of Thrones')
      expect(results[2]).to.have.property('genre').to.equal('action')
      expect(results[2]).to.have.property('id').to.be.a('string')

      expect(results[3]).to.have.property('name').to.equal('The Walking Dead')
      expect(results[3]).to.have.property('genre').to.equal('action')
      expect(results[3]).to.have.property('id').to.be.a('string')

      expect(results[4]).to.have.property('name').to.equal('West Wing')
      expect(results[4]).to.have.property('genre').to.equal('drama')
      expect(results[4]).to.have.property('id').to.be.a('string')
    })
  })

  describe('with prop filters', () => {
    it('returns filtered normalised results', async () => {
      const response = await store.readAll({
        type: collectionName,
        filters: { genre: 'action' }
      })
      const results = orderBy(response, ['name'])
      expect(results[0]).to.have.property('name').to.equal('Daredevil')
      expect(results[0]).to.have.property('genre').to.equal('action')
      expect(results[0]).to.have.property('id').to.be.a('string')

      expect(results[1]).to.have.property('name').to.equal('Game of Thrones')
      expect(results[1]).to.have.property('genre').to.equal('action')
      expect(results[1]).to.have.property('id').to.be.a('string')

      expect(results[2]).to.have.property('name').to.equal('The Walking Dead')
      expect(results[2]).to.have.property('genre').to.equal('action')
      expect(results[2]).to.have.property('id').to.be.a('string')
    })
  })

  describe('with dateTo filter', () => {
    it('returns filtered normalised results', async () => {
      const response = await store.readAll({
        type: collectionName,
        filters: {
          dateTo: '2016-12-14 13:04:11'
        }
      })
      const results = orderBy(response, ['name'])
      expect(results[0]).to.have.property('name').to.equal('The Walking Dead')
      expect(results[0]).to.have.property('genre').to.equal('action')
      expect(results[0]).to.have.property('id').to.be.a('string')

      expect(results[1]).to.have.property('name').to.equal('West Wing')
      expect(results[1]).to.have.property('genre').to.equal('drama')
      expect(results[1]).to.have.property('id').to.be.a('string')
    })
  })

  describe('with dateFrom filter', () => {
    it('returns filtered normalised results', async () => {
      const response = await store.readAll({
        type: collectionName,
        filters: {
          dateFrom: '2016-12-17 13:04:11'
        }
      })
      const results = orderBy(response, ['name'])
      expect(results[0]).to.have.property('name').to.equal('Black Mirror')
      expect(results[0]).to.have.property('genre').to.equal('sci-fi horror')
      expect(results[0]).to.have.property('id').to.be.a('string')

      expect(results[1]).to.have.property('name').to.equal('Daredevil')
      expect(results[1]).to.have.property('genre').to.equal('action')
      expect(results[1]).to.have.property('id').to.be.a('string')

      expect(results[2]).to.have.property('name').to.equal('Game of Thrones')
      expect(results[2]).to.have.property('genre').to.equal('action')
      expect(results[2]).to.have.property('id').to.be.a('string')
    })
  })

  describe('with date filters', () => {
    it('returns filtered normalised results', async () => {
      const response = await store.readAll({
        type: collectionName,
        filters: {
          dateFrom: '2016-12-17 13:04:11',
          dateTo: '2016-12-19 13:04:11'
        }
      })
      const results = orderBy(response, ['name'])
      expect(results[0]).to.have.property('name').to.equal('Black Mirror')
      expect(results[0]).to.have.property('genre').to.equal('sci-fi horror')
      expect(results[0]).to.have.property('id').to.be.a('string')

      expect(results[1]).to.have.property('name').to.equal('Game of Thrones')
      expect(results[1]).to.have.property('genre').to.equal('action')
      expect(results[1]).to.have.property('id').to.be.a('string')
    })
  })

  describe('with combined date and prop filters', () => {
    it('returns filtered normalised results', async () => {
      const response = await store.readAll({
        type: collectionName,
        filters: {
          dateFrom: '2016-12-17 13:04:11',
          dateTo: '2016-12-19 13:04:11',
          genre: 'action'
        }
      })
      const results = orderBy(response, ['name'])
      expect(results[0]).to.have.property('name').to.equal('Game of Thrones')
      expect(results[0]).to.have.property('genre').to.equal('action')
      expect(results[0]).to.have.property('id').to.be.a('string')
    })
  })
})
