/* eslint-env mocha */
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')

const {
  db,
  sql,
  nosql,
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
} = require('../../../../scripts/00003-arango-to-mysql/helpers')

const script = require('../../../../scripts/00003-arango-to-mysql')

chai.use(chaiAsPromised)

describe('00003 Arango to MySQL', () => {
  async function seedRun (data) {
    await populateCollections(db, data)
    await script({ db, sql, nosql })
  }

  before(async () => {
    await setupCollections(db, TABLE_ORDER.map(table => tableToCollection(table)))
    await setupCollections(nosql, ['referralIdMaps'])
  })

  afterEach(async () => {
    await truncateCollections(db)
    await truncateCollections(nosql)
  })

  after(async () => {
    await teardownCollections(db)
    await teardownCollections(nosql)
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
                _id: 'surveys/123',
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
        const surveys = await sql.select().from(TABLES.SURVEYS)
        expect(surveys[0]).to.have.property('slug', 'survey-slug')
        expect(surveys[0]).to.have.property('introTitle', 'Intro Title')
        expect(surveys[0]).to.have.property('introDescription', 'Intro description')
        expect(surveys[0]).to.have.property('outroTitle', 'Outro Title')
        expect(surveys[0]).to.have.property('outroDescription', 'Outro description')
        expect(surveys[0]).to.have.property('surveySections', JSON.stringify(['surveySection1', 'surveySection2']))
      })

      it('should remap the relations', async () => {
        const surveys = await sql.select().from(TABLES.SURVEYS)
        const companies = await sql.select().from(TABLES.COMPANIES)
        expect(surveys[0]).to.have.property('company', companies[0].id)
      })
    })
  })
})
