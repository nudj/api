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
  let migration
  let mockLibrary = {
    generateId: sinon.stub().returns(NEW_ID)
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
        throw new Error('document found')
      } catch (error) {
        expect(error.message).to.equal('document not found')
      }
    })

    it('should recreate the document under the new id', async () => {
      const collection = await db.collection(COLLECTION)
      const doc = await collection.firstExample({
        '_key': NEW_ID
      })
      expect(doc).to.exist()
    })

    it('should recreate all the static properties in the new item', async () => {
      const collection = await db.collection(COLLECTION)
      const doc = await collection.firstExample({
        '_key': NEW_ID
      })
      expect(doc).to.have.property('prop', 'value')
      expect(doc).to.have.property('created', '2018-01-01T12:00:00.000Z')
      expect(doc).to.have.property('modified', '2018-01-01T12:00:00.000Z')
    })

    it('should replace not add the new item', async () => {
      const collection = await db.collection(COLLECTION)
      const data = await collection.count()
      expect(data.count).to.equal(1)
    })
  })
})
