const {
  db,
  setupDatabase,
  truncateDatabase,
  populateDbCollection,
  expect
} = require('../lib')

const Store = require('../../gql/adaptors/arango/store')

const collectionName = 'vegetables'

const resetDataStore = async (database) => {
  await setupDatabase(database)
  await populateDbCollection(database, collectionName, [
    {
      _key: 'vegetable1',
      name: 'Carrot'
    },
    {
      _key: 'vegetable2',
      name: 'Spinach'
    },
    {
      _key: 'vegetable3',
      name: 'Leek'
    },
    {
      _key: 'vegetable4',
      name: 'Potato'
    },
    {
      _key: 'vegetable5',
      name: 'Kale'
    }
  ])
  return Store({ db })
}

describe('readMany', () => {
  let store
  beforeEach(async () => {
    store = await resetDataStore(db)
  })

  afterEach(async () => {
    await truncateDatabase(db)
  })

  it('returns all normalised results', async () => {
    const result = await store.readMany({
      type: collectionName,
      ids: [ 'vegetable1', 'vegetable4' ]
    })
    expect(result).to.deep.equal([
      {
        id: 'vegetable1',
        name: 'Carrot'
      },
      {
        id: 'vegetable4',
        name: 'Potato'
      }
    ])
  })

  it('returns an empty array with no ids', async () => {
    const result = await store.readMany({
      type: collectionName,
      ids: []
    })
    expect(result).to.deep.equal([])
  })
})
