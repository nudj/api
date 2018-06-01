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
const migration = require('../../../../migrations/00015-convert-job-bonus-string')
const { fetchAll } = require('../../../../lib')

chai.use(chaiAsPromised)

describe('00015 Convert Job.bonus to String', () => {
  const executeMigration = ({ direction }) => {
    return migration[direction]({
      db,
      step: (description, actions) => actions()
    })
  }

  beforeEach(async () => {
    await setupCollections(db, [
      'jobs'
    ])
  })

  afterEach(async () => {
    await truncateCollections(db)
  })

  after(async () => {
    await teardownCollections(db)
  })

  describe('up', () => {
    describe('when migration has not been run', () => {
      beforeEach(async () => {
        await populateCollections(db, [
          {
            name: 'jobs',
            data: [
              {
                _key: 'job1',
                bonus: 500
              }
            ]
          }
        ])
      })

      it('should convert the integer into a string with a £', async () => {
        await executeMigration({ direction: 'up' })
        const jobs = await fetchAll(db, 'jobs')
        expect(jobs[0]).to.have.property('bonus').to.equal('£500')
      })
    })

    describe('when up has already been run', () => {
      beforeEach(async () => {
        await populateCollections(db, [
          {
            name: 'jobs',
            data: [
              {
                _key: 'job1',
                bonus: '£500'
              }
            ]
          }
        ])
      })

      it('should not add multiple £s', async () => {
        await executeMigration({ direction: 'up' })
        const jobs = await fetchAll(db, 'jobs')
        expect(jobs[0]).to.have.property('bonus').to.equal('£500')
      })
    })
  })

  describe('down', () => {
    describe('when migration has not been run', () => {
      beforeEach(async () => {
        await populateCollections(db, [
          {
            name: 'jobs',
            data: [
              {
                _key: 'job1',
                bonus: '£500'
              }
            ]
          }
        ])
      })

      it('should revert the string into an integer', async () => {
        await executeMigration({ direction: 'down' })
        const jobs = await fetchAll(db, 'jobs')
        expect(jobs[0]).to.have.property('bonus').to.equal(500)
      })
    })

    describe('when up has already been run', () => {
      beforeEach(async () => {
        await populateCollections(db, [
          {
            name: 'jobs',
            data: [
              {
                _key: 'job1',
                bonus: 500
              }
            ]
          }
        ])
      })

      it('should noop', async () => {
        await executeMigration({ direction: 'down' })
        const jobs = await fetchAll(db, 'jobs')
        expect(jobs[0]).to.have.property('bonus').to.equal(500)
      })
    })
  })
})
