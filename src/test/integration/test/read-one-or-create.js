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

const collectionName = 'sandwiches'

const resetDataStore = async () => populateCollections(db, [
  {
    collection: collectionName,
    data: [
      {
        bread: 'white',
        filling: 'cheese'
      },
      {
        bread: 'brown',
        filling: 'cheese'
      },
      {
        bread: 'white',
        filling: 'ham'
      }
    ]
  }
])

describe('readOneOrCreate', () => {
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

  describe('if filtered item exists', () => {
    it('does not create new item', async () => {
      const sandwich = {
        bread: 'white',
        filling: 'cheese'
      }
      const sandwichesCollection = await db.collection(collectionName).all()
      expect(sandwichesCollection.count).to.equal(3)
      await store.readOneOrCreate({
        type: collectionName,
        filters: sandwich,
        data: sandwich
      })
      const newSandwichesCollection = await db.collection(collectionName).all()
      expect(newSandwichesCollection.count).to.equal(3)
      expect(await sandwichesCollection.all()).to.deep.equal(await newSandwichesCollection.all())
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
      expect(result).to.have.property('bread').to.equal('white')
      expect(result).to.have.property('filling').to.equal('cheese')
      expect(result).to.have.property('id').to.be.a('string')
    })
  })

  describe('if filtered item does not exist', () => {
    it('creates a new item', async () => {
      const sandwich = {
        bread: 'gluten-free',
        filling: 'bacon'
      }
      const sandwichesCollection = await db.collection(collectionName).all()
      expect(sandwichesCollection.count).to.equal(3)
      await store.readOneOrCreate({
        type: collectionName,
        filters: sandwich,
        data: sandwich
      })
      const updatedSandwichesCollection = await db.collection(collectionName).all()
      const updatedResults = orderBy(await updatedSandwichesCollection.all(), ['filling'])
      expect(updatedSandwichesCollection.count).to.equal(4)
      expect(updatedResults[0]).to.have.property('bread').to.equal('gluten-free')
      expect(updatedResults[0]).to.have.property('filling').to.equal('bacon')
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
