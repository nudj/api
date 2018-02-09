/* eslint-env mocha */
const sortBy = require('lodash/sortBy')
const {
  db,
  setupCollections,
  teardownCollections,
  truncateCollections,
  populateCollections,
  expect
} = require('../lib')

const Store = require('../../gql/adaptors/arango/store')

const collectionName = 'tvSeries'

const resetDataStore = async () => populateCollections(db, [
  {
    collection: collectionName,
    data: [
      {
        name: 'The Walking Dead',
        ratings: 'high',
        genre: 'action'
      },
      {
        name: 'West Wing',
        ratings: 'high',
        genre: 'drama'
      },
      {
        name: 'Takeshi\'s Castle',
        ratings: 'average',
        genre: 'gameshow'
      },
      {
        name: 'Black Mirror',
        ratings: 'average',
        genre: 'sci-fi horror'
      },
      {
        name: 'Land of the Dead',
        ratings: 'low',
        genre: 'action'
      },
      {
        name: 'Drake',
        ratings: 'low',
        genre: 'thriller'
      },
      {
        name: 'Dead Island',
        ratings: 'average',
        genre: 'horror'
      },
      {
        name: 'Waking Ned',
        ratings: 'average',
        genre: 'drama'
      },
      {
        name: 'End Game',
        ratings: 'high',
        genre: 'thriller'
      }
    ]
  }
])

describe('search', () => {
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
    it('returns normalised results with single field', async () => {
      const response = await store.search({
        type: collectionName,
        query: 'Wa',
        fields: [
          ['name']
        ]
      })
      const results = sortBy(response, ['name'])
      expect(results.length).to.equal(2)
      expect(results[0]).to.have.property('name').to.equal('The Walking Dead')
      expect(results[1]).to.have.property('name').to.equal('Waking Ned')
    })

    it('returns normalised results with multiple fields', async () => {
      const response = await store.search({
        type: collectionName,
        query: 'Dra',
        fields: [
          ['name'],
          ['genre']
        ],
        filters: {
          ratings: 'low'
        }
      })
      expect(response.length).to.equal(1)
      expect(response[0]).to.have.property('name').to.equal('Drake')
    })

    it('returns normalised results with combined fields', async () => {
      const response = await store.search({
        type: collectionName,
        query: 'land horror',
        fields: [
          ['name', 'genre']
        ]
      })
      expect(response.length).to.equal(1)
      expect(response[0]).to.have.property('name').to.equal('Dead Island')
    })
  })

  describe('with filters', () => {
    it('returns normalised results with single field', async () => {
      const response = await store.search({
        type: collectionName,
        query: 'Wa',
        fields: [
          ['name']
        ],
        filters: {
          ratings: 'high'
        }
      })
      expect(response.length).to.equal(1)
      expect(response[0]).to.have.property('name').to.equal('The Walking Dead')
    })

    it('returns normalised results with multiple fields', async () => {
      const response = await store.search({
        type: collectionName,
        query: 'game',
        fields: [
          ['name'],
          ['genre']
        ],
        filters: {
          ratings: 'average'
        }
      })
      expect(response.length).to.equal(1)
      expect(response[0]).to.have.property('name').to.equal('Takeshi\'s Castle')
    })

    it('returns normalised results with combined fields', async () => {
      const response = await store.search({
        type: collectionName,
        query: 'dead action',
        fields: [
          ['name', 'genre']
        ],
        filters: {
          ratings: 'low'
        }
      })
      expect(response.length).to.equal(1)
      expect(response[0]).to.have.property('name').to.equal('Land of the Dead')
    })
  })
})
