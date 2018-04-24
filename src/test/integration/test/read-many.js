/* eslint-env mocha */
const orderBy = require('lodash/orderBy')
const {
  db,
  setupCollections,
  teardownCollections,
  truncateCollections,
  expect
} = require('../lib')

const Store = require('../../../gql/adaptors/arango/store')
const setupDataLoaderCache = require('../../../gql/lib/setup-dataloader-cache')

const collectionName = 'vegetables'

const createNewEntry = (name) => {
  return db.collection(collectionName).save({ name })
}

describe('readMany', () => {
  let store
  before(async () => {
    await setupCollections(db, [collectionName])
  })

  beforeEach(async () => {
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

  it('returns all normalised results', async () => {
    const { _key: idOne } = await createNewEntry('Broccoli')
    const { _key: idTwo } = await createNewEntry('Kale')
    const response = await store.readMany({
      type: collectionName,
      ids: [ idOne, idTwo ]
    })
    const results = orderBy(response, ['name'])
    expect(results[0]).to.have.property('name').to.equal('Broccoli')
    expect(results[0]).to.have.property('id').to.equal(idOne)
    expect(results[1]).to.have.property('name').to.equal('Kale')
    expect(results[1]).to.have.property('id').to.equal(idTwo)
  })

  it('returns an empty array with no ids', async () => {
    const result = await store.readMany({
      type: collectionName,
      ids: []
    })
    expect(result).to.deep.equal([])
  })
})
