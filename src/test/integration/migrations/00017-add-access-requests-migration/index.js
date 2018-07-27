/* eslint-env mocha */
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
const migration = require('../../../../migrations/00017-add-access-requests-collection')

chai.use(chaiAsPromised)

describe('00017 Add accessRequests collection', () => {
  const executeMigration = ({ direction }) => {
    return migration[direction]({
      db,
      step: (description, actions) => actions()
    })
  }

  afterEach(async () => {
    await truncateCollections(db)
  })

  after(async () => {
    await teardownCollections(db)
  })

  describe('up', () => {
    describe('when migration has not been run', () => {
      it('should add the collection', async () => {
        await executeMigration({ direction: 'up' })
        const collection = db.collection('accessRequests')
        const data = await collection.get()
        expect(data).to.exist()
      })
    })

    describe('when up has already been run', () => {
      beforeEach(async () => {
        await setupCollections(db, [ 'accessRequests' ])
        await populateCollections(db, [
          {
            name: 'accessRequests',
            data: [
              {
                _key: 'accessRequest1',
                person: 'person1',
                company: 'company1'
              }
            ]
          }
        ])
      })

      it('should not reject', async () => {
        await expect(executeMigration({ direction: 'up' })).to.eventually.be.fulfilled()
      })
    })
  })

  describe('down', () => {
    describe('when migration has not been run', () => {
      beforeEach(async () => {
        await setupCollections(db, [ 'accessRequests' ])
        await populateCollections(db, [
          {
            name: 'accessRequests',
            data: [
              {
                _key: 'accessRequest1',
                person: 'person1',
                company: 'company1'
              }
            ]
          }
        ])
      })

      it('should remove the collection', async () => {
        await executeMigration({ direction: 'down' })
        const collection = db.collection('accessRequests')
        await expect(collection.get()).to.eventually.be.rejected()
      })
    })

    describe('when up has already been run', () => {
      it('should not reject', async () => {
        await expect(executeMigration({ direction: 'down' })).to.eventually.be.fulfilled()
      })
    })
  })
})
