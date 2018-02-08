const omit = require('lodash/omit')
const {
  db,
  setupDatabase,
  truncateDatabase,
  populateDbCollection,
  expect
} = require('../lib')

const Store = require('../../gql/adaptors/arango/store')

const collectionName = 'tvSeries'

const resetDataStore = async (database) => {
  await setupDatabase(database)
  await populateDbCollection(database, collectionName, [
    {
      _key: 'tvSeries1',
      created: '2016-12-12T13:04:11.248Z',
      name: 'The Walking Dead',
      genre: 'action'
    },
    {
      _key: 'tvSeries2',
      created: '2016-12-14T13:04:11.248Z',
      name: 'West Wing',
      genre: 'drama'
    },
    {
      _key: 'tvSeries3',
      created: '2016-12-18T13:04:11.248Z',
      name: 'Black Mirror',
      genre: 'sci-fi horror'
    },
    {
      _key: 'tvSeries4',
      created: '2016-12-19T13:04:11.248Z',
      name: 'Game of Thrones',
      genre: 'action'
    },
    {
      _key: 'tvSeries5',
      created: '2016-12-20T13:04:11.248Z',
      name: 'Daredevil',
      genre: 'action'
    }
  ])
  return Store({ db })
}

describe('readAll', () => {
  let store
  beforeEach(async () => {
    store = await resetDataStore(db)
  })

  afterEach(async () => {
    await truncateDatabase(db)
  })

  describe('with no filters', () => {
    it('returns all normalised results', async () => {
      const result = await store.readAll({
        type: collectionName
      })
      expect(result).to.deep.equal([
        {
          id: 'tvSeries2',
          created: '2016-12-14T13:04:11.248Z',
          name: 'West Wing',
          genre: 'drama'
        },
        {
          id: 'tvSeries1',
          created: '2016-12-12T13:04:11.248Z',
          name: 'The Walking Dead',
          genre: 'action'
        },
        {
          id: 'tvSeries5',
          created: '2016-12-20T13:04:11.248Z',
          name: 'Daredevil',
          genre: 'action'
        },
        {
          id: 'tvSeries3',
          created: '2016-12-18T13:04:11.248Z',
          name: 'Black Mirror',
          genre: 'sci-fi horror'
        },
        {
          id: 'tvSeries4',
          created: '2016-12-19T13:04:11.248Z',
          name: 'Game of Thrones',
          genre: 'action'
        }
      ])
    })
  })

  describe('with general filters', () => {
    it('returns filtered normalised results', async () => {
      const result = await store.readAll({
        type: collectionName,
        filters: { genre: 'action' }
      })
      expect(result).to.deep.equal([
        {
          id: 'tvSeries1',
          created: '2016-12-12T13:04:11.248Z',
          name: 'The Walking Dead',
          genre: 'action'
        },
        {
          id: 'tvSeries5',
          created: '2016-12-20T13:04:11.248Z',
          name: 'Daredevil',
          genre: 'action'
        },
        {
          id: 'tvSeries4',
          created: '2016-12-19T13:04:11.248Z',
          name: 'Game of Thrones',
          genre: 'action'
        }
      ])
    })
  })

  describe('with dateTo filter', () => {
    it('returns filtered normalised results', async () => {
      const result = await store.readAll({
        type: collectionName,
        filters: {
          dateTo: '2016-12-14T13:04:11.248Z'
        }
      })
      expect(result).to.deep.equal([
        {
          id: 'tvSeries2',
          created: '2016-12-14T13:04:11.248Z',
          name: 'West Wing',
          genre: 'drama'
        },
        {
          id: 'tvSeries1',
          created: '2016-12-12T13:04:11.248Z',
          name: 'The Walking Dead',
          genre: 'action'
        }
      ])
    })
  })

  describe('with dateFrom filter', () => {
    it('returns filtered normalised results', async () => {
      const result = await store.readAll({
        type: collectionName,
        filters: {
          dateFrom: '2016-12-17T13:04:11.248Z'
        }
      })
      expect(result).to.deep.equal([
        {
          id: 'tvSeries5',
          created: '2016-12-20T13:04:11.248Z',
          name: 'Daredevil',
          genre: 'action'
        },
        {
          id: 'tvSeries3',
          created: '2016-12-18T13:04:11.248Z',
          name: 'Black Mirror',
          genre: 'sci-fi horror'
        },
        {
          id: 'tvSeries4',
          created: '2016-12-19T13:04:11.248Z',
          name: 'Game of Thrones',
          genre: 'action'
        }
      ])
    })
  })

  describe('with date filters', () => {
    it('returns filtered normalised results', async () => {
      const result = await store.readAll({
        type: collectionName,
        filters: {
          dateFrom: '2016-12-17T13:04:11.248Z',
          dateTo: '2016-12-19T13:04:11.248Z'
        }
      })
      expect(result).to.deep.equal([
        {
          id: 'tvSeries3',
          created: '2016-12-18T13:04:11.248Z',
          name: 'Black Mirror',
          genre: 'sci-fi horror'
        },
        {
          id: 'tvSeries4',
          created: '2016-12-19T13:04:11.248Z',
          name: 'Game of Thrones',
          genre: 'action'
        }
      ])
    })
  })

  describe('with combined date and general filters', () => {
    it('returns filtered normalised results', async () => {
      const result = await store.readAll({
        type: collectionName,
        filters: {
          dateFrom: '2016-12-17T13:04:11.248Z',
          dateTo: '2016-12-19T13:04:11.248Z',
          genre: 'action'
        }
      })
      expect(result).to.deep.equal([
        {
          id: 'tvSeries4',
          created: '2016-12-19T13:04:11.248Z',
          name: 'Game of Thrones',
          genre: 'action'
        }
      ])
    })
  })
})
