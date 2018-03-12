/* eslint-env mocha */
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const {
  db,
  setupCollections,
  populateCollections,
  truncateCollections,
  teardownCollections,
  expect
} = require('../../lib')
const collections = require('../../lib/data')

chai.use(chaiAsPromised)

describe('00004 Generated Ids for the accounts collection', () => {
  const COLLECTION = 'accounts'
  const NEW_ID = 'NEW_ID'
  const NEW_HASH = 'NEW_HASH'
  let migration
  let mockLibrary = {
    generateId: sinon.stub().returns(NEW_ID),
    generateHash: sinon.stub().returns(NEW_HASH)
  }
  const executeMigration = () => {
    return migration.up({
      db,
      step: (description, actions) => actions()
    })
  }

  before(async () => {
    migration = proxyquire('../../../../migrations/00004-generated-ids', {
      '@nudj/library': mockLibrary
    })
  })

  beforeEach(async () => {
    await setupCollections(db, collections.map(collection => collection.name))
    await populateCollections(db, collections)
    await executeMigration()
  })

  afterEach(async () => {
    mockLibrary.generateId.reset()
    mockLibrary.generateHash.reset()
    await truncateCollections(db)
  })

  after(async () => {
    await teardownCollections(db)
  })

  describe('when looping over the collection', () => {
    it('should remove the old document', async () => {
      const collection = await db.collection(COLLECTION)
      try {
        await collection.document('ID')
      } catch (error) {
        expect(error.message).to.equal('document not found')
      }
    })

    it('should recreate the document under the new id', async () => {
      const collection = await db.collection(COLLECTION)
      const doc = await collection.firstExample({
        '_key': NEW_HASH
      })
      expect(doc).to.exist()
    })

    it('should recreate all the static properties in the new item', async () => {
      const collection = await db.collection(COLLECTION)
      const doc = await collection.firstExample({
        '_key': NEW_HASH
      })
      expect(doc).to.have.property('prop', 'value')
    })

    it('should replace not add the new item', async () => {
      const collection = await db.collection(COLLECTION)
      const data = await collection.count()
      expect(data.count).to.equal(1)
    })
  })
})
