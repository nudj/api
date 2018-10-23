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
} = require('../../../../scripts/00010-arango-to-mysql/helpers')

const script = require('../../../../scripts/00010-arango-to-mysql')

chai.use(chaiAsPromised)

describe('00010 Arango to MySQL', () => {
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

  describe('for surveys table', () => {
    const COLLECTIONS = {
      SURVEYS: TABLES.SURVEYS,
      SURVEY_SECTIONS: TABLES.SURVEY_SECTIONS,
      COMPANIES: TABLES.COMPANIES
    }

    afterEach(async () => {
      await sql(TABLES.SURVEY_SECTIONS).whereNot('id', '').del()
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
                slug: 'company-ltd',
                hash: '123'
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
                surveySections: ['surveySection1'],
                batchSize: 100,
                skip: 0
              }
            ]
          },
          {
            name: COLLECTIONS.SURVEY_SECTIONS,
            data: [
              {
                _id: 'surveySections/surveySection1',
                _rev: '_WpP1l3W---',
                _key: 'surveySection1',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                slug: 'survey-slug',
                title: 'Intro Title',
                description: 'Intro description',
                survey: '123',
                surveyQuestions: []
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
      })

      it('should remap the order caches', async () => {
        const surveys = await sql.select().from(TABLES.SURVEYS)
        const surveySections = await sql.select().from(TABLES.SURVEY_SECTIONS)
        expect(surveys[0]).to.have.property('surveySections', JSON.stringify([surveySections[0].id]))
      })
    })

    describe('when slug does not exist', () => {
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
                slug: 'company-ltd',
                hash: '123'
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
                introTitle: 'Intro Title',
                introDescription: 'Intro description',
                outroTitle: 'Outro Title',
                outroDescription: 'Outro description',
                surveySections: ['surveySection1'],
                batchSize: 100,
                skip: 0
              }
            ]
          },
          {
            name: COLLECTIONS.SURVEY_SECTIONS,
            data: [
              {
                _id: 'surveySections/surveySection1',
                _rev: '_WpP1l3W---',
                _key: 'surveySection1',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                slug: 'survey-slug',
                title: 'Intro Title',
                description: 'Intro description',
                survey: '123',
                surveyQuestions: []
              }
            ]
          }
        ])
      })

      it('should generate a new slug from introTitle', async () => {
        const surveys = await sql.select().from(TABLES.SURVEYS)
        expect(surveys[0]).to.have.property('slug', 'intro-title')
      })
    })
  })
})
