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
  TABLES,
  ENUMS
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

  describe('for surveyQuestions table', () => {
    const COLLECTIONS = {
      SURVEY_QUESTIONS: tableToCollection(TABLES.SURVEY_QUESTIONS),
      SURVEY_SECTIONS: tableToCollection(TABLES.SURVEY_SECTIONS),
      SURVEYS: tableToCollection(TABLES.SURVEYS),
      COMPANIES: tableToCollection(TABLES.COMPANIES)
    }

    afterEach(async () => {
      await sql(TABLES.SURVEY_QUESTIONS).whereNot('id', '').del()
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
                slug: 'company-ltd'
              }
            ]
          },
          {
            name: COLLECTIONS.SURVEYS,
            data: [
              {
                _key: 'survey1',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                slug: 'survey-slug',
                introTitle: 'Intro Title',
                introDescription: 'Intro description',
                outroTitle: 'Outro Title',
                outroDescription: 'Outro description',
                surveySections: JSON.stringify(['surveySection1', 'surveySection2']),
                company: 'company1'
              }
            ]
          },
          {
            name: COLLECTIONS.SURVEY_SECTIONS,
            data: [
              {
                _key: 'surveySection1',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                slug: 'survey-section-slug',
                title: 'Title',
                description: 'Description',
                surveyQuestions: JSON.stringify(['surveyQuestion1', 'surveyQuestion2']),
                survey: 'survey1'
              }
            ]
          },
          {
            name: COLLECTIONS.SURVEY_QUESTIONS,
            data: [
              {
                _id: 'surveyQuestions/123',
                _rev: '_WpP1l3W---',
                _key: '123',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                slug: 'survey-question-slug',
                title: 'Title',
                description: 'Description',
                required: true,
                type: ENUMS.QUESTION_TYPES.CONNECTIONS,
                surveySection: 'surveySection1',
                batchSize: 100,
                skip: 0
              }
            ]
          }
        ])
      })

      genericExpectationsForTable(TABLES.SURVEY_SECTIONS)

      it('should transfer all scalar properties', async () => {
        const surveyQuestions = await sql.select().from(TABLES.SURVEY_QUESTIONS)
        expect(surveyQuestions[0]).to.have.property('slug', 'survey-question-slug')
        expect(surveyQuestions[0]).to.have.property('title', 'Title')
        expect(surveyQuestions[0]).to.have.property('description', 'Description')
        expect(surveyQuestions[0]).to.have.property('required', 1)
        expect(surveyQuestions[0]).to.have.property('type', ENUMS.QUESTION_TYPES.CONNECTIONS)
      })

      it('should remap the relations', async () => {
        const surveyQuestions = await sql.select().from(TABLES.SURVEY_QUESTIONS)
        const surveySections = await sql.select().from(TABLES.SURVEY_SECTIONS)
        expect(surveyQuestions[0]).to.have.property('surveySection', surveySections[0].id)
      })
    })
  })
})
