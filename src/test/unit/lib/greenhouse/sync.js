/* eslint-env mocha */
const chai = require('chai')
const filter = require('lodash/filter')
const orderBy = require('lodash/orderBy')
const clone = require('lodash/cloneDeep')
const { store } = require('../../../../gql/adaptors/lodash')
const greenhouseSync = require('../../../../gql/lib/greenhouse/sync')
const { values: hirerTypes } = require('../../../../gql/schema/enums/hirer-types')
const { values: jobStatusTypes } = require('../../../../gql/schema/enums/job-status-types')
const expect = chai.expect

const mockGreenhouseJobs = [
  { id: 'gJob1', confidential: false, status: 'open' },
  { id: 'gJob2', confidential: false, status: 'closed' },
  { id: 'gJob4', confidential: false, status: 'draft' },
  { id: 'gJob9', confidential: true, status: 'open' }
]

const mockGreenhouseJobPosts = [
  { id: 'gJobPost1', job_id: 'gJob1', title: 'Job 1', content: 'description!', external: true, live: true, active: true, location: { name: 'Pembrokshire' } },
  { id: 'gJobPost2', job_id: 'gJob2', title: 'Job 2', content: 'description!', external: true, live: true, active: true },
  { id: 'gJobPost4', job_id: 'gJob4', title: 'Job 4', content: 'description!', external: true, live: true, active: true },
  { id: 'gJobPost1.1', job_id: 'gJob1', title: 'Job 1 Internal', content: 'description!', external: false, live: true, active: true },
  { id: 'gJobPost2.1', job_id: 'gJob2', title: 'Job 2 Not Live', content: 'description!', external: true, live: false, active: true },
  { id: 'gJobPost4.1', job_id: 'gJob2', title: 'Job 4 Not Active', content: 'description!', external: true, live: true, active: false }
]

const baseDB = {
  applications: [
    { id: 'application1', job: 'job3' }
  ],
  referrals: [
    { id: 'referral1', job: 'job3' }
  ],
  intros: [
    { id: 'intro1', job: 'job3' }
  ],
  jobTags: [
    { id: 'jobTag1', job: 'job3' }
  ],
  atsJobs: [
    { id: 'atsJob1', externalId: 'gJob1', company: 'company1', jobId: 'job1' },
    { id: 'atsJob2', externalId: 'gJob2', company: 'company1', jobId: 'job2' },
    { id: 'atsJob3', externalId: 'gJob3', company: 'company1', jobId: 'job3' }
  ],
  jobs: [
    { id: 'job1', company: 'company1' },
    { id: 'job2', company: 'company1' },
    { id: 'job3', company: 'company1' }
  ],
  companies: [{
    id: 'company1',
    name: 'Company One'
  }],
  hirers: [{
    id: 'hirer1',
    person: 'person1',
    company: 'company1',
    type: hirerTypes.ADMIN
  }],
  people: [{
    id: 'person1'
  }]
}

describe('Greenhouse sync', () => {
  let sync
  let context
  let db

  describe('when sync is successful', () => {
    beforeEach(() => {
      db = clone(baseDB)
      sync = greenhouseSync({
        harvest: {
          get: (type, filters) => {
            if (type === 'jobs') {
              return Promise.resolve(filters ? filter(mockGreenhouseJobs, filters) : mockGreenhouseJobs)
            }
            if (type === 'job_posts') {
              return Promise.resolve(filters ? filter(mockGreenhouseJobPosts, filters) : mockGreenhouseJobPosts)
            }
          }
        }
      })
      context = { store: store({ db }), userId: 'person1' }
    })

    it('returns true', async () => {
      const result = await sync(context)
      expect(result).to.be.true()
    })

    it('sets `Company.syncing` as false', async () => {
      await sync(context)
      expect(db.companies[0]).to.have.property('syncing', false)
    })

    it('creates the appropriate jobs', async () => {
      await sync(context)
      const jobs = orderBy(db.jobs, 'title')

      expect(jobs.length).to.equal(4)

      expect(jobs[2]).to.have.property('title', 'Job 4')
      expect(jobs[2]).to.have.property('description', 'description!')
      expect(jobs[2]).to.have.property('location', '')
      expect(jobs[2]).to.have.property('status', jobStatusTypes.DRAFT)
      expect(jobs[3]).to.have.property('status', jobStatusTypes.DELETED)
    })

    it('updates the appropriate jobs', async () => {
      await sync(context)

      await sync(context)
      const jobs = orderBy(db.jobs, 'title')

      expect(jobs.length).to.equal(4)

      expect(jobs[0]).to.have.property('title', 'Job 1')
      expect(jobs[0]).to.have.property('description', 'description!')
      expect(jobs[0]).to.have.property('location', 'Pembrokshire')
      expect(jobs[0]).to.have.property('status', jobStatusTypes.PUBLISHED)

      expect(jobs[1]).to.have.property('title', 'Job 2')
      expect(jobs[1]).to.have.property('description', 'description!')
      expect(jobs[1]).to.have.property('status', jobStatusTypes.ARCHIVED)
    })

    it('deletes the appropriate jobs', async () => {
      const jobToBeDeleted = db.jobs.filter(job => job.id === 'job3')[0]
      expect(jobToBeDeleted).to.exist()

      await sync(context)

      const deletedJob = db.jobs.filter(job => job.id === 'job3')[0]
      expect(deletedJob).to.have.property('status', jobStatusTypes.DELETED)
    })
  })

  describe('when sync fails', () => {
    beforeEach(() => {
      db = clone(baseDB)
      sync = greenhouseSync({
        harvest: {
          get: (type, filters) => {
            throw new Error('Invalid Basic Auth credentials')
          }
        }
      })
      context = { store: store({ db }), userId: 'person1' }
    })

    it('throws an error', async () => {
      try {
        await sync(context)
        throw new Error('Should have already errored')
      } catch (error) {
        expect(error.message).to.equal('Invalid Basic Auth credentials')
      }
    })

    it('sets `Company.syncing` as false', async () => {
      try {
        await sync(context)
      } catch (error) {
        expect(error).to.exist()
      }

      expect(db.companies[0]).to.have.property('syncing', false)
    })
  })

  describe('when the user is not an admin', () => {
    beforeEach(() => {
      db = clone(baseDB)
      sync = greenhouseSync({
        harvest: {
          get: (type, filters) => {
            if (type === 'jobs') {
              return Promise.resolve(filters ? filter(mockGreenhouseJobs, filters) : mockGreenhouseJobs)
            }
            if (type === 'job_posts') {
              return Promise.resolve(filters ? filter(mockGreenhouseJobPosts, filters) : mockGreenhouseJobPosts)
            }
          }
        }
      })
      context = { store: store({ db }), userId: 'person2' }
    })

    it('throws an error', async () => {
      try {
        await sync(context)
        throw new Error('Should not have reached this error')
      } catch (error) {
        expect(error.message).to.equal('User does not have permissions to sync Greenhouse jobs')
      }
    })

    it('does not sync jobs', async () => {
      try {
        await sync(context)
      } catch (error) {
        expect(error).to.exist()
      }

      expect(db.jobs).to.deep.equal(baseDB.jobs)
    })
  })

  describe('when the company is already syncing', () => {
    beforeEach(() => {
      db = {
        ...clone(baseDB),
        companies: [{
          id: 'company1',
          name: 'Company One',
          syncing: true
        }]
      }
      sync = greenhouseSync({
        harvest: {
          get: (type, filters) => {
            if (type === 'jobs') {
              return Promise.resolve(filters ? filter(mockGreenhouseJobs, filters) : mockGreenhouseJobs)
            }
            if (type === 'job_posts') {
              return Promise.resolve(filters ? filter(mockGreenhouseJobPosts, filters) : mockGreenhouseJobPosts)
            }
          }
        }
      })
      context = { store: store({ db }), userId: 'person1' }
    })

    it('throws an error', async () => {
      try {
        await sync(context)
        throw new Error('Should not have reached this error')
      } catch (error) {
        expect(error.message).to.equal('Greenhouse syncing is already in progress')
      }
    })

    it('does not sync jobs', async () => {
      try {
        await sync(context)
      } catch (error) {
        expect(error).to.exist()
      }

      expect(db.jobs).to.deep.equal(baseDB.jobs)
    })
  })

  describe('when the Greenhouse rate limit has been reached', () => {
    beforeEach(() => {
      db = clone(baseDB)
      sync = greenhouseSync({
        harvest: {
          get: (type, filters) => {
            const error = new Error('Request failed with status 429')
            error.code = 429
            throw error
          }
        }
      })
      context = { store: store({ db }), userId: 'person1' }
    })

    it('throws an error', async () => {
      try {
        await sync(context)
        throw new Error('Should not have reached this error')
      } catch (error) {
        expect(error.message).to.equal('Rate limit reached')
        expect(error.code).to.equal(429)
      }
    })

    it('does not sync jobs', async () => {
      try {
        await sync(context)
      } catch (error) {
        expect(error).to.exist()
      }

      expect(db.jobs).to.deep.equal(baseDB.jobs)
    })
  })
})
