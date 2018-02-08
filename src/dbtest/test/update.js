const {
  db,
  setupDatabase,
  truncateDatabase,
  populateDbCollection,
  expect
} = require('../lib')

const Store = require('../../gql/adaptors/arango/store')

const collectionName = 'sandwiches'

const resetDataStore = async (database) => {
  await setupDatabase(database)
  await populateDbCollection(database, collectionName, [
    {
      _key: 'sandwich1',
      bread: 'white',
      filling: 'cheese'
    },
    {
      _key: 'sandwich2',
      bread: 'brown',
      filling: 'cheese'
    },
    {
      _key: 'sandwich3',
      bread: 'white',
      filling: 'ham'
    }
  ])
  return Store({ db })
}

describe('update', () => {
  let store
  beforeEach(async () => {
    store = await resetDataStore(db)
  })

  afterEach(async () => {
    await truncateDatabase(db)
  })

  describe('if filtered item exists', () => {
    it('does not create new item', async () => {
      const sandwich = {
        bread: 'white',
        filling: 'cheese'
      }
      const sandwichesCollection = await db.collection('sandwiches').all()
      expect(sandwichesCollection.count).to.equal(3)
      await store.readOneOrCreate({
        type: collectionName,
        filters: sandwich,
        data: sandwich
      })
      const updatedSandwichesCollection = await db.collection('sandwiches').all()
      expect(updatedSandwichesCollection.count).to.equal(3)
    })

    it('returns normalised data of existing item', async () => {
      const sandwich = {
        bread: 'white',
        filling: 'cheese'
      }
      const result = await store.readOneOrCreate({
        type: collectionName,
        filters: sandwich,
        data: sandwich
      })
      expect(result).to.deep.equal({
        id: 'sandwich1',
        bread: 'white',
        filling: 'cheese'
      })
    })
  })

  describe('if filtered item does not exist', () => {
    it('creates a new item', async () => {
      const sandwich = {
        bread: 'gluten-free',
        filling: 'bacon'
      }
      const sandwichesCollection = await db.collection('sandwiches').all()
      expect(sandwichesCollection.count).to.equal(3)
      await store.readOneOrCreate({
        type: collectionName,
        filters: sandwich,
        data: sandwich
      })
      const updatedSandwichesCollection = await db.collection('sandwiches').all()
      expect(updatedSandwichesCollection.count).to.equal(4)
    })

    it('returns normalised data of new item', async () => {
      const sandwich = {
        bread: 'brioche',
        filling: 'beef'
      }
      const result = await store.readOneOrCreate({
        type: collectionName,
        filters: sandwich,
        data: sandwich
      })
      expect(result).to.have.property('bread').to.equal('brioche')
      expect(result).to.have.property('filling').to.equal('beef')
      expect(result).to.have.property('id').to.be.a('string')
    })
  })
})
