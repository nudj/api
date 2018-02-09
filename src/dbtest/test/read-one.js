/* eslint-env mocha */
const {
  db,
  setupCollections,
  teardownCollections,
  truncateCollections,
  populateCollections,
  expect
} = require('../lib')

const Store = require('../../gql/adaptors/arango/store')

const collectionName = 'people'

const createNewEntry = async () => {
  const result = await db.collection(collectionName).save({
    firstName: 'Doctor',
    lastName: 'Strangelove',
    email: 'drstrange@love.com'
  })
  return result._key
}

const resetDataStore = async () => populateCollections(db, [
  {
    collection: collectionName,
    data: [
      {
        firstName: 'Dave',
        lastName: 'The Rave',
        email: 'dave@therave.com'
      },
      {
        firstName: 'Danny',
        lastName: 'Giovanna',
        email: 'dantheman@geeohvan.com'
      },
      {
        firstName: 'Karen',
        lastName: 'Rotarua',
        email: 'rottykar87@gmail.com'
      }
    ]
  }
])

describe('readOne', () => {
  let store
  let testId
  before(async () => {
    await setupCollections(db, [collectionName])
  })

  beforeEach(async () => {
    await resetDataStore()
    testId = await createNewEntry()
    store = Store({ db })
  })

  after(async () => {
    await teardownCollections(db, [collectionName])
  })

  afterEach(async () => {
    await truncateCollections(db, [collectionName])
  })

  describe('with filters', () => {
    it('returns normalised data', async () => {
      const result = await store.readOne({
        type: collectionName,
        filters: { email: 'dave@therave.com' }
      })
      expect(result).to.have.property('email').to.equal('dave@therave.com')
      expect(result).to.have.property('firstName').to.equal('Dave')
      expect(result).to.have.property('lastName').to.equal('The Rave')
      expect(result).to.have.property('id').to.be.a('string')
    })
  })

  describe('with an id', () => {
    it('returns normalised data', async () => {
      const result = await store.readOne({
        type: collectionName,
        id: testId
      })
      expect(result).to.have.property('email').to.equal('drstrange@love.com')
      expect(result).to.have.property('firstName').to.equal('Doctor')
      expect(result).to.have.property('lastName').to.equal('Strangelove')
      expect(result).to.have.property('id').to.equal(testId)
    })
  })

  describe('with an id and filters', () => {
    it('returns normalised data based on filters', async () => {
      const result = await store.readOne({
        type: collectionName,
        id: testId,
        filters: { email: 'rottykar87@gmail.com' }
      })
      expect(result).to.have.property('email').to.equal('rottykar87@gmail.com')
      expect(result).to.have.property('firstName').to.equal('Karen')
      expect(result).to.have.property('lastName').to.equal('Rotarua')
      expect(result).to.have.property('id').to.not.equal(testId)
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
