/* eslint-env mocha */
const {
  db,
  setupCollections,
  teardownCollections,
  truncateCollections,
  expect
} = require('../lib')

const Store = require('../../../gql/adaptors/arango/store')

const collectionName = 'emails'

const createNewEntry = async () => {
  const result = await db.collection(collectionName).save({
    subject: 'RE: Embarrassing email!',
    from: 'email@address.com'
  })
  return result._key
}

describe('delete', () => {
  let store
  let testId
  before(async () => {
    await setupCollections(db, [collectionName])
  })

  beforeEach(async () => {
    testId = await createNewEntry()
    store = Store({ db })
  })

  after(async () => {
    await teardownCollections(db, [collectionName])
  })

  afterEach(async () => {
    await truncateCollections(db, [collectionName])
  })

  it('removes an entry from the collection', async () => {
    const emailsCollection = await db.collection(collectionName).all()
    expect(emailsCollection.count).to.equal(1)
    await store.delete({
      type: collectionName,
      id: testId
    })
    const updatedEmailsCollection = await db.collection(collectionName).all()
    expect(updatedEmailsCollection.count).to.equal(0)
  })

  it('returns normalised version of deleted item', async () => {
    const result = await store.delete({
      type: collectionName,
      id: testId
    })
    expect(result).to.have.property('id').to.equal(testId)
    expect(result).to.have.property('from').to.equal('email@address.com')
    expect(result).to.have.property('subject').to.equal('RE: Embarrassing email!')
  })
})
