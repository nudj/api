const {
  db,
  setupDatabase,
  truncateDatabase,
  populateDbCollection,
  expect
} = require('../lib')

const Store = require('../../gql/adaptors/arango/store')

const collectionName = 'people'

const resetDataStore = async (database) => {
  await setupDatabase(database)
  await populateDbCollection(database, collectionName, [
    {
      _key: 'person1',
      firstName: 'Dave',
      lastName: 'The Rave',
      email: 'dave@therave.com'
    },
    {
      _key: 'person2',
      firstName: 'Danny',
      lastName: 'Giovanna',
      email: 'dantheman@geeohvan.com'
    },
    {
      _key: 'person3',
      firstName: 'Karen',
      lastName: 'Rotarua',
      email: 'rottykar87@gmail.com'
    }
  ])
  return Store({ db })
}

describe('readOne', () => {
  let store
  beforeEach(async () => {
    store = await resetDataStore(db)
  })

  afterEach(async () => {
    await truncateDatabase(db)
  })

  describe('with filters', () => {
    it('returns normalised data', async () => {
      const result = await store.readOne({
        type: collectionName,
        filters: { email: 'dave@therave.com' }
      })
      expect(result).to.deep.equal({
        id: 'person1',
        firstName: 'Dave',
        lastName: 'The Rave',
        email: 'dave@therave.com'
      })
    })
  })

  describe('with an id', () => {
    it('returns normalised data', async () => {
      const result = await store.readOne({
        type: collectionName,
        id: 'person3'
      })
      expect(result).to.deep.equal({
        id: 'person3',
        firstName: 'Karen',
        lastName: 'Rotarua',
        email: 'rottykar87@gmail.com'
      })
    })
  })

  describe('with an id and filters', () => {
    it('returns normalised data based on filters', async () => {
      const result = await store.readOne({
        type: collectionName,
        id: 'person2',
        filters: { email: 'rottykar87@gmail.com' }
      })
      expect(result).to.deep.equal({
        id: 'person3',
        firstName: 'Karen',
        lastName: 'Rotarua',
        email: 'rottykar87@gmail.com'
      })
    })
  })

  describe('with no id or filters', () => {
    it('returns null', async () => {
      const result = await store.readOne({
        type: collectionName
      })
      expect(result).to.be.null()
    })
  })
})
