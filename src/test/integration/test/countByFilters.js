/* eslint-env mocha */
const {
  db,
  setupCollections,
  teardownCollections,
  truncateCollections,
  populateCollections,
  expect
} = require('../lib')

const Store = require('../../../gql/adaptors/arango/store')
const setupDataLoaderCache = require('../../../gql/lib/setup-dataloader-cache')

const collectionName = 'dogs'

const resetDataStore = () => populateCollections(db, [
  {
    name: collectionName,
    data: [
      {
        created: '2016-12-12T13:04:11.248Z',
        name: 'Patches',
        breed: 'Mutt',
        type: 'good boy'
      },
      {
        created: '2016-12-14T13:04:11.248Z',
        name: 'Biscuit',
        breed: 'Golden Retriever',
        type: 'good boy'
      },
      {
        created: '2016-12-18T13:04:11.248Z',
        name: 'Jaffa',
        breed: 'Chihuahua',
        type: 'good boy'
      },
      {
        created: '2016-12-19T13:04:11.248Z',
        name: 'Fluff',
        breed: 'Poodle',
        type: 'good girl'
      },
      {
        created: '2016-12-20T13:04:11.248Z',
        name: 'Sheva',
        breed: 'German Shepherd',
        type: 'good girl'
      }
    ]
  }
])

describe('countByFilters', () => {
  let store
  before(async () => {
    await setupCollections(db, [collectionName])
  })

  beforeEach(async () => {
    await resetDataStore()
    store = Store({
      db,
      getDataLoader: setupDataLoaderCache(db, {})
    })
  })

  after(async () => {
    await teardownCollections(db, [collectionName])
  })

  afterEach(async () => {
    await truncateCollections(db, [collectionName])
  })

  it('returns total count of entites', async () => {
    const result = await store.countByFilters({
      type: collectionName
    })
    expect(result).to.equal(5)
  })

  describe('with prop filters', () => {
    it('returns total count of filtered entities', async () => {
      const result = await store.countByFilters({
        type: collectionName,
        filters: {
          type: 'good boy'
        }
      })
      expect(result).to.deep.equal(3)
    })
  })

  describe('with dateTo filter', () => {
    it('returns total count of filtered entities', async () => {
      const result = await store.countByFilters({
        type: collectionName,
        filters: {
          dateTo: '2016-12-14T13:04:11.248Z'
        }
      })
      expect(result).to.deep.equal(2)
    })
  })

  describe('with dateFrom filter', () => {
    it('returns total count of filtered entities', async () => {
      const result = await store.countByFilters({
        type: collectionName,
        filters: {
          dateFrom: '2016-12-14T19:04:11.248Z'
        }
      })
      expect(result).to.deep.equal(4)
    })
  })

  describe('with date filters', () => {
    it('returns total count of filtered entities', async () => {
      const result = await store.countByFilters({
        type: collectionName,
        filters: {
          dateFrom: '2016-12-13T19:04:11.248Z',
          dateTo: '2016-12-14T13:04:11.248Z'
        }
      })
      expect(result).to.deep.equal(1)
    })
  })

  describe('with both date and prop filters', () => {
    it('returns total count of filtered entities', async () => {
      const result = await store.countByFilters({
        type: collectionName,
        filters: {
          dateFrom: '2016-12-18T19:04:11.248Z',
          dateTo: '2016-12-19T13:04:11.248Z',
          type: 'good girl'
        }
      })
      expect(result).to.deep.equal(1)
    })
  })
})
