/* eslint-env mocha */
const {
  db,
  setupCollections,
  teardownCollections,
  truncateCollections,
  expect
} = require('../lib')

const Store = require('../../gql/adaptors/arango/store')

const collectionName = 'dogs'

const createNewEntry = async () => {
  const result = await db.collection(collectionName).save({
    created: '2016-12-12T13:04:11.248Z',
    modified: '2017-12-12T13:04:11.248Z',
    name: 'Patches',
    breed: 'Mutt',
    type: 'good boy'
  })
  return result._key
}

describe('update', () => {
  let store
  let testId
  before(async () => {
    await setupCollections(db, [collectionName])
  })

  beforeEach(async () => {
    store = Store({ db })
    testId = await createNewEntry()
  })

  after(async () => {
    await teardownCollections(db, [collectionName])
  })

  afterEach(async () => {
    await truncateCollections(db, [collectionName])
  })

  it('updates the entity by id', async () => {
    const goodBoy = await db.collection(collectionName).document(testId)
    expect(goodBoy).to.have.property('breed').to.equal('Mutt')
    await store.update({
      type: collectionName,
      id: testId,
      data: {
        breed: 'Labrador Collie'
      }
    })
    const newGoodBoy = await db.collection(collectionName).document(testId)
    expect(newGoodBoy).to.have.property('breed').to.equal('Labrador Collie')
  })

  it('returns the updated entity', async () => {
    const result = await store.update({
      type: collectionName,
      id: testId,
      data: {
        breed: 'Labrador Collie'
      }
    })
    expect(result).to.have.property('breed').to.equal('Labrador Collie')
    expect(result).to.have.property('id').to.equal(testId)
  })

  it('updates the entity\'s \'modified\' date', async () => {
    const goodBoy = await db.collection(collectionName).document(testId)
    const { modified } = goodBoy
    const result = await store.update({
      type: collectionName,
      id: testId,
      data: {
        breed: 'Labrador Collie'
      }
    })
    expect(result).to.have.property('modified').to.not.equal(modified)
  })
})
