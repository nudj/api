/* eslint-env mocha */
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const orderBy = require('lodash/orderBy')
const {
  db,
  setupCollections,
  populateCollections,
  truncateCollections,
  teardownCollections,
  expect
} = require('../../lib')
const migration = require('../../../../migrations/00026-add-syncing-flag-to-companies')
const { fetchAll } = require('../../../../lib')

chai.use(chaiAsPromised)

describe('00026 Add syncing flag to companies', () => {
  const executeMigration = ({ direction }) => {
    return migration[direction]({
      db,
      step: (description, actions) => actions()
    })
  }

  beforeEach(async () => {
    await setupCollections(db, ['companies'])
  })

  afterEach(async () => {
    await truncateCollections(db)
  })

  after(async () => {
    await teardownCollections(db)
  })

  describe('up', () => {
    beforeEach(async () => {
      await populateCollections(db, [
        {
          name: 'companies',
          data: [
            { _key: 'company1' },
            { _key: 'company2' },
            { _key: 'company3', syncing: false },
            { _key: 'company4' },
            { _key: 'company5', syncing: true }
          ]
        }
      ])
    })

    describe('when migration has not been run', () => {
      it('adds the `syncing: false` flag to the companies', async () => {
        await executeMigration({ direction: 'up' })
        const data = await fetchAll(db, 'companies')
        const companies = orderBy(data, ['_key'])

        expect(companies[0]).to.have.property('syncing').to.be.false()
        expect(companies[1]).to.have.property('syncing').to.be.false()
        expect(companies[2]).to.have.property('syncing').to.be.false()
        expect(companies[3]).to.have.property('syncing').to.be.false()
      })

      it('does not update the `syncing` flag for currently syncing companies', async () => {
        await executeMigration({ direction: 'up' })
        const data = await fetchAll(db, 'companies')
        const companies = orderBy(data, ['_key'])

        expect(companies[4]).to.have.property('syncing').to.be.true()
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
        await setupCollections(db, ['companies'])
        await populateCollections(db, [
          {
            name: 'companies',
            data: [
              { _key: 'company1' },
              { _key: 'company2' },
              { _key: 'company3', syncing: false },
              { _key: 'company4' },
              { _key: 'company5', syncing: true }
            ]
          }
        ])
      })

      it('should remove the `syncing` flag from companies', async () => {
        await executeMigration({ direction: 'up' })
        await executeMigration({ direction: 'down' })
        const data = await fetchAll(db, 'companies')
        const companies = orderBy(data, ['_key'])

        expect(companies[0]).to.not.have.property('syncing')
        expect(companies[1]).to.not.have.property('syncing')
        expect(companies[2]).to.not.have.property('syncing')
        expect(companies[3]).to.not.have.property('syncing')
      })
    })

    describe('when migration `up` has not been run', () => {
      it('should not reject', async () => {
        await expect(executeMigration({ direction: 'down' })).to.eventually.be.fulfilled()
      })
    })
  })
})
