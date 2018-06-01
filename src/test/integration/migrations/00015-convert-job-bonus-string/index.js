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
      'companies',
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
    describe('when has not been run', () => {
      describe('for UK jobs', () => {
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

      describe('for SalesI job', () => {
        beforeEach(async () => {
          await populateCollections(db, [
            {
              name: 'companies',
              data: [
                {
                  _key: 'company1',
                  slug: 'sales-i'
                }
              ]
            },
            {
              name: 'jobs',
              data: [
                {
                  _key: 'job1',
                  slug: 'marketing-coordinator',
                  company: 'company1',
                  bonus: 500
                }
              ]
            }
          ])
        })

        it('should convert the integer into a string with a $', async () => {
          await executeMigration({ direction: 'up' })
          const jobs = await fetchAll(db, 'jobs')
          expect(jobs[0]).to.have.property('bonus').to.equal('$500')
        })
      })
    })

    describe('when has already been run', () => {
      describe('for UK jobs', () => {
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

        it('should be a noop', async () => {
          await executeMigration({ direction: 'up' })
          const jobs = await fetchAll(db, 'jobs')
          expect(jobs[0]).to.have.property('bonus').to.equal('£500')
        })
      })

      describe('for SalesI job', () => {
        beforeEach(async () => {
          await populateCollections(db, [
            {
              name: 'companies',
              data: [
                {
                  _key: 'company1',
                  slug: 'sales-i'
                }
              ]
            },
            {
              name: 'jobs',
              data: [
                {
                  _key: 'job1',
                  slug: 'marketing-coordinator',
                  company: 'company1',
                  bonus: '$500'
                }
              ]
            }
          ])
        })

        it('should be a noop', async () => {
          await executeMigration({ direction: 'up' })
          const jobs = await fetchAll(db, 'jobs')
          expect(jobs[0]).to.have.property('bonus').to.equal('$500')
        })
      })
    })
  })

  describe('down', () => {
    describe('when has not been run', () => {
      describe('for UK jobs', () => {
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

        it('should revert the string to an integer', async () => {
          await executeMigration({ direction: 'down' })
          const jobs = await fetchAll(db, 'jobs')
          expect(jobs[0]).to.have.property('bonus').to.equal(500)
        })
      })

      describe('for SalesI job', () => {
        beforeEach(async () => {
          await populateCollections(db, [
            {
              name: 'companies',
              data: [
                {
                  _key: 'company1',
                  slug: 'sales-i'
                }
              ]
            },
            {
              name: 'jobs',
              data: [
                {
                  _key: 'job1',
                  slug: 'marketing-coordinator',
                  company: 'company1',
                  bonus: '$500'
                }
              ]
            }
          ])
        })

        it('should revert the string to an integer', async () => {
          await executeMigration({ direction: 'down' })
          const jobs = await fetchAll(db, 'jobs')
          expect(jobs[0]).to.have.property('bonus').to.equal(500)
        })
      })
    })

    describe('when has already been run', () => {
      describe('for UK jobs', () => {
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

        it('should be a noop', async () => {
          await executeMigration({ direction: 'down' })
          const jobs = await fetchAll(db, 'jobs')
          expect(jobs[0]).to.have.property('bonus').to.equal(500)
        })
      })

      describe('for SalesI job', () => {
        beforeEach(async () => {
          await populateCollections(db, [
            {
              name: 'companies',
              data: [
                {
                  _key: 'company1',
                  slug: 'sales-i'
                }
              ]
            },
            {
              name: 'jobs',
              data: [
                {
                  _key: 'job1',
                  slug: 'marketing-coordinator',
                  company: 'company1',
                  bonus: 500
                }
              ]
            }
          ])
        })

        it('should be a noop', async () => {
          await executeMigration({ direction: 'down' })
          const jobs = await fetchAll(db, 'jobs')
          expect(jobs[0]).to.have.property('bonus').to.equal(500)
        })
      })
    })
  })
})
