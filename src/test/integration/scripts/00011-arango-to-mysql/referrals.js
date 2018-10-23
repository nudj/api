/* eslint-env mocha */
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')

const {
  db,
  sql,
  setupCollections,
  populateCollections,
  truncateCollections,
  teardownCollections,
  expect,
  genericExpectationsForTable
} = require('../../lib')
const {
  TABLES
} = require('../../../../lib/sql')
const {
  OLD_COLLECTIONS
} = require('../../../../scripts/00011-arango-to-mysql/helpers')

const script = require('../../../../scripts/00011-arango-to-mysql')

chai.use(chaiAsPromised)

describe('00011 Arango to MySQL', () => {
  async function seedRun (data) {
    await populateCollections(db, data)
    await script({ db, sql })
  }

  before(async () => {
    await setupCollections(db, Object.values(OLD_COLLECTIONS))
  })

  afterEach(async () => {
    await truncateCollections(db)
  })

  after(async () => {
    await teardownCollections(db)
  })

  describe('for referrals table', () => {
    const COLLECTIONS = {
      REFERRALS: TABLES.REFERRALS,
      PEOPLE: TABLES.PEOPLE,
      COMPANIES: TABLES.COMPANIES,
      JOBS: TABLES.JOBS
    }

    afterEach(async () => {
      await sql(TABLES.REFERRAL_KEY_TO_SLUG_MAP).whereNot('referralKey', '').del()
      await sql(TABLES.REFERRALS).whereNot('id', '').del()
      await sql(TABLES.JOBS).whereNot('id', '').del()
      await sql(TABLES.PEOPLE).whereNot('id', '').del()
      await sql(TABLES.COMPANIES).whereNot('id', '').del()
    })

    describe('with a full data set', () => {
      beforeEach(async () => {
        await seedRun([
          {
            name: COLLECTIONS.PEOPLE,
            data: [
              {
                _key: 'person1',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                email: 'jim@bob.com',
                firstName: 'Jim',
                lastName: 'Bob'
              },
              {
                _key: 'person2',
                created: '2019-02-01T01:02:03.456Z',
                modified: '2019-03-02T02:03:04.567Z',
                email: 'jom@bib.com',
                firstName: 'Jom',
                lastName: 'Bib'
              }
            ]
          },
          {
            name: COLLECTIONS.COMPANIES,
            data: [
              {
                _key: 'company1',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                name: 'Company Ltd',
                slug: 'company-ltd',
                hash: '123'
              }
            ]
          },
          {
            name: COLLECTIONS.JOBS,
            data: [
              {
                _key: 'job1',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                title: 'Job title',
                slug: 'job-title',
                bonus: 1000,
                company: 'company1'
              }
            ]
          },
          {
            name: COLLECTIONS.REFERRALS,
            data: [
              {
                _id: 'referrals/123',
                _rev: '_WpP1l3W---',
                _key: 'referral1',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                person: 'person1',
                job: 'job1',
                batchSize: 100,
                skip: 0
              },
              {
                _id: 'referrals/234',
                _rev: '_WpP1l3W---',
                _key: 'referral2',
                created: '2019-02-01T01:02:03.456Z',
                modified: '2019-03-02T02:03:04.567Z',
                person: 'person2',
                job: 'job1',
                parent: 'referral1',
                batchSize: 100,
                skip: 0
              }
            ]
          }
        ])
      })

      genericExpectationsForTable(TABLES.REFERRALS, 2)

      it('should remap the relations', async () => {
        const referrals = await sql.select().from(TABLES.REFERRALS).orderBy('created', 'asc')
        const jobs = await sql.select().from(TABLES.JOBS).orderBy('created', 'asc')
        const people = await sql.select().from(TABLES.PEOPLE).orderBy('created', 'asc')

        expect(referrals[0]).to.have.property('job', jobs[0].id)
        expect(referrals[0]).to.have.property('person', people[0].id)

        expect(referrals[1]).to.have.property('job', jobs[0].id)
        expect(referrals[1]).to.have.property('person', people[1].id)
        expect(referrals[1]).to.have.property('parent', referrals[0].id)
      })

      it('should use defaults', async () => {
        const referrals = await sql.select().from(TABLES.REFERRALS).orderBy('created', 'asc')
        expect(referrals[0]).to.have.property('parent', null)
      })

      it('should generate a random slug', async () => {
        const referrals = await sql.select().from(TABLES.REFERRALS)
        expect(referrals[0]).to.have.property('slug').to.match(/^[a-z0-9]{10}$/)
      })

      it('should store a key->slug map in the NoSQL store', async () => {
        const referrals = await sql.select().from(TABLES.REFERRALS).orderBy('created', 'asc')

        const referral1IdMap = await sql.select().from(TABLES.REFERRAL_KEY_TO_SLUG_MAP).where({
          referralKey: 'referral1'
        })
        expect(referral1IdMap[0]).to.exist()
        expect(referral1IdMap[0]).to.have.property('jobSlug', referrals[0].slug)

        const referral2IdMap = await sql.select().from(TABLES.REFERRAL_KEY_TO_SLUG_MAP).where({
          referralKey: 'referral2'
        })
        expect(referral2IdMap[0]).to.exist()
        expect(referral2IdMap[0]).to.have.property('jobSlug', referrals[1].slug)
      })
    })
  })
})
