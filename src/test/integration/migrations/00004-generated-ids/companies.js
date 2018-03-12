/* eslint-env mocha */
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const chaiAsPromised = require('chai-as-promised')
const {
  db,
  setupCollections,
  populateCollections,
  truncateCollections,
  teardownCollections,
  expect
} = require('../../lib')
const data = require('../../lib/data')
const {
  getFirstItemFromCollection
} = require('../../lib/helpers')

chai.use(sinonChai)
chai.use(chaiAsPromised)

describe('00004 Generated Ids for the companies collection', () => {
  const COLLECTION = 'companies'
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
    await setupCollections(db, data.map(collection => collection.name))
    await populateCollections(db, data)
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
    })

    it('should replace not add the new item', async () => {
      const collection = await db.collection(COLLECTION)
      const data = await collection.count()
      expect(data.count).to.equal(1)
    })

    it('should call `generateId` with type and item', async () => {
      sinon.assert.calledWith(mockLibrary.generateId, 'company', sinon.match({
        _id: 'companies/ID',
        _key: 'ID',
        prop: 'value'
      }))
    })
  })

  describe('when checking for relations across the db', () => {
    it('should update Connection.company', async () => {
      const doc = await getFirstItemFromCollection('connections', db)
      expect(doc).to.have.property('company', NEW_ID)
    })

    it('should update Job.company', async () => {
      const doc = await getFirstItemFromCollection('jobs', db)
      expect(doc).to.have.property('company', NEW_ID)
    })

    it('should update Employment.company', async () => {
      const doc = await getFirstItemFromCollection('employments', db)
      expect(doc).to.have.property('company', NEW_ID)
    })

    it('should update Hirer.company', async () => {
      const doc = await getFirstItemFromCollection('hirers', db)
      expect(doc).to.have.property('company', NEW_ID)
    })

    it('should update Survey.company', async () => {
      const doc = await getFirstItemFromCollection('surveys', db)
      expect(doc).to.have.property('company', NEW_ID)
    })
  })
})
