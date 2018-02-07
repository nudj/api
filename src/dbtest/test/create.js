const omit = require('lodash/omit')
const {
  db,
  setupDatabase,
  truncateDatabase,
  populateDbCollection,
  expect
} = require('../lib')

const Store = require('../../gql/adaptors/arango/store')

const collectionName = 'fruits'

const resetDataStore = async (database) => {
  await setupDatabase(database)
  await populateDbCollection(database, collectionName, [
    {
      _key: 'fruit1',
      name: 'Banana',
      colour: 'Yellow',
      peelable: true
    },
    {
      _key: 'fruit2',
      name: 'Kiwi',
      colour: 'Green',
      peelable: false
    }
  ])
  return Store({ db })
}

describe('create', () => {
  let store
  beforeEach(async () => {
    store = await resetDataStore(db)
  })

  afterEach(async () => {
    await truncateDatabase(db)
  })

  it('adds a new entry to the collection', async () => {
    const fruitsCollection = await db.collection('fruits').all()
    expect(fruitsCollection.count).to.equal(2)
    const result = await store.create({
      type: collectionName,
      data: {
        name: 'Apple',
        colour: 'Red or Green',
        peelable: false
      }
    })
    const updatedFruitsCollection = await db.collection('fruits').all()
    expect(updatedFruitsCollection.count).to.equal(3)
  })

  it('returns normalised version of new item', async () => {
    const result = await store.create({
      type: collectionName,
      data: {
        _key: 'fruit3',
        name: 'Cherry',
        colour: 'Red',
        peelable: false
      }
    })
    expect(omit(result, ['created', 'modified'])).to.deep.equal(
      omit(
        {
          id: 'fruit3',
          name: 'Cherry',
          colour: 'Red',
          peelable: false
        },
        ['created', 'modified']
      )
    )
  })

  it('adds a created and modified date', async () => {
    const result = await store.create({
      type: collectionName,
      data: {
        _key: 'fruit3',
        name: 'Orange',
        colour: 'Orange',
        peelable: true
      }
    })
    const isValidDate = (timestamp) => (new Date(timestamp)).getTime() > 0
    expect(result.created).to.exist()
    expect(result.modified).to.exist()
    expect(isValidDate(result.created)).to.be.true()
    expect(isValidDate(result.modified)).to.be.true()
  })
})
