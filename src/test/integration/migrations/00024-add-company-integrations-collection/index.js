/* eslint-env mocha */
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const {
  db,
  setupCollections,
  truncateCollections,
  teardownCollections,
  expect
} = require('../../lib')
const migration = require('../../../../migrations/00024-add-company-integrations-collection')

chai.use(chaiAsPromised)

describe('00024 Add companyIntegrations collection', () => {
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
        const collection = db.collection('companyIntegrations')
        const data = await collection.get()
        expect(data).to.exist()
      })
    })

    describe('when up has already been run', () => {
      beforeEach(async () => {
        await executeMigration({ direction: 'up' })
      })

      it('should not reject', async () => {
        expect(executeMigration({ direction: 'up' })).to.eventually.be.fulfilled()
      })
    })
  })

  describe('down', () => {
    describe('when migration `up` has already been run', () => {
      beforeEach(async () => {
        await setupCollections(db, ['companyIntegrations'])
      })

      it('should remove the collection', async () => {
        await executeMigration({ direction: 'down' })
        const collection = db.collection('companyIntegrations')
        await expect(collection.get()).to.eventually.be.rejected()
      })
    })

    describe('when migration `up` has not been run', () => {
      it('should not reject', async () => {
        await expect(executeMigration({ direction: 'down' })).to.eventually.be.fulfilled()
      })
    })
  })
})
