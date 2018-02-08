const omit = require('lodash/omit')
const {
  db,
  setupDatabase,
  truncateDatabase,
  populateDbCollection,
  expect
} = require('../lib')

const Store = require('../../gql/adaptors/arango/store')

const collectionName = 'emails'

const resetDataStore = async (db) => {
  await setupDatabase(db)
  await populateDbCollection(db, collectionName, [
    {
      _key: 'email1',
      subject: 'Boring Stuff',
      from: 'doctorbore@whocares.com'
    },
    {
      _key: 'email2',
      subject: 'RE: Embarrassing email!',
      from: 'email@address.com'
    }
  ])
  return Store({ db })
}

describe('delete', () => {
  let store
  beforeEach(async () => {
    store = await resetDataStore(db)
  })

  afterEach(async () => {
    await truncateDatabase(db)
  })

  it('removes an entry from the collection', async () => {
    const emailsCollection = await db.collection(collectionName).all()
    expect(emailsCollection.count).to.equal(2)
    await store.delete({
      type: collectionName,
      id: 'email2'
    })
    const updatedEmailsCollection = await db.collection(collectionName).all()
    expect(updatedEmailsCollection.count).to.equal(1)
  })

  it('returns normalised version of deleted item', async () => {
    const result = await store.delete({
      type: collectionName,
      id: 'email1'
    })
    expect(result).to.deep.equal({
      id: 'email1',
      from: 'doctorbore@whocares.com',
      subject: 'Boring Stuff'
    })
  })
})
