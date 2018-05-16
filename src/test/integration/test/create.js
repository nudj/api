/* eslint-env mocha */
const isValid = require('date-fns/is_valid')
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

const collectionName = 'fruits'

const resetDataStore = async () => populateCollections(db, [
  {
    name: collectionName,
    data: [
      {
        name: 'Banana',
        colour: 'Yellow',
        peelable: true
      },
      {
        name: 'Kiwi',
        colour: 'Green',
        peelable: false
      }
    ]
  }
])

describe('create', () => {
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

  it('adds a new entry to the collection', async () => {
    const fruitsCollection = await db.collection(collectionName).all()
    expect(fruitsCollection.count).to.equal(2)
    const result = await store.create({
      type: collectionName,
      data: {
        name: 'Apple',
        colour: 'Red or Green',
        peelable: false
      }
    })
    const updatedFruitsCollection = await db.collection(collectionName).all()
    const results = orderBy(await updatedFruitsCollection.all(), ['name'])
    expect(results[0]).to.have.property('_key').to.equal(result.id)
    expect(results[0]).to.have.property('name').to.equal('Apple')
    expect(results[0]).to.have.property('colour').to.equal('Red or Green')
    expect(results[0]).to.have.property('peelable').to.be.false()
  })

  it('returns normalised version of new item', async () => {
    const result = await store.create({
      type: collectionName,
      data: {
        name: 'Cherry',
        colour: 'Red',
        peelable: false
      }
    })
    expect(result).to.have.property('name').to.equal('Cherry')
    expect(result).to.have.property('colour').to.equal('Red')
    expect(result).to.have.property('peelable').to.be.false()
  })

  it('adds a created and modified date', async () => {
    const result = await store.create({
      type: collectionName,
      data: {
        name: 'Orange',
        colour: 'Orange',
        peelable: true
      }
    })
    const isValidDate = (timestamp) => isValid(new Date(timestamp))
    expect(result.created).to.exist()
    expect(result.modified).to.exist()
    expect(isValidDate(result.created)).to.be.true()
    expect(isValidDate(result.modified)).to.be.true()
  })
})
