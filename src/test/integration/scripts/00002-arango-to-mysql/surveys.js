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
  TABLE_ORDER,
  tableToCollection
} = require('../../../../scripts/00002-arango-to-mysql/helpers')

const script = require('../../../../scripts/00002-arango-to-mysql')

chai.use(chaiAsPromised)

describe.only('00002 Arango to MySQL', () => {
  async function seedRun (data) {
    await populateCollections(db, data)
    await script({ db, sql })
  }

  before(async () => {
    await setupCollections(db, TABLE_ORDER.map(table => tableToCollection(table)))
  })

  afterEach(async () => {
    await truncateCollections(db)
  })

  after(async () => {
    await teardownCollections(db)
  })

  describe('for surveys table', () => {
    const COLLECTIONS = {
      SURVEYS: tableToCollection(TABLES.SURVEYS),
      COMPANIES: tableToCollection(TABLES.COMPANIES)
    }

    afterEach(async () => {
      await sql(TABLES.SURVEYS).whereNot('id', '').del()
      await sql(TABLES.COMPANIES).whereNot('id', '').del()
    })

    describe('with a full data set', () => {
      beforeEach(async () => {
        await seedRun([
          {
            name: COLLECTIONS.COMPANIES,
            data: [
              {
                _key: 'company1',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                name: 'Company Ltd',
                slug: 'company-ltd'
              }
            ]
          },
          {
            name: COLLECTIONS.SURVEYS,
            data: [
              {
                _id: 'employments/123',
                _rev: '_WpP1l3W---',
                _key: '123',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                slug: 'survey-slug',
                introTitle: 'Intro Title',
                introDescription: 'Intro description',
                outroTitle: 'Outro Title',
                outroDescription: 'Outro description',
                surveySections: JSON.stringify(['surveySection1', 'surveySection2']),
                company: 'company1',
                batchSize: 100,
                skip: 0
              }
            ]
          }
        ])
      })

      genericExpectationsForTable(TABLES.SURVEYS)

      it('should transfer all scalar properties', async () => {
        const personRoles = await sql.select().from(TABLES.SURVEYS)
        expect(personRoles[0]).to.have.property('slug', 'survey-slug')
        expect(personRoles[0]).to.have.property('introTitle', 'Intro Title')
        expect(personRoles[0]).to.have.property('introDescription', 'Intro description')
        expect(personRoles[0]).to.have.property('outroTitle', 'Outro Title')
        expect(personRoles[0]).to.have.property('outroDescription', 'Outro description')
        expect(personRoles[0]).to.have.property('surveySections', JSON.stringify(['surveySection1', 'surveySection2']))
      })

      it('should remap the relations', async () => {
        const personRoles = await sql.select().from(TABLES.SURVEYS)
        const companies = await sql.select().from(TABLES.COMPANIES)
        expect(personRoles[0]).to.have.property('company', companies[0].id)
      })
    })
  })
})
