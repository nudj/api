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

  describe.only('for surveyAnswers table', () => {
    const COLLECTIONS = {
      SURVEY_ANSWERS: tableToCollection(TABLES.SURVEY_ANSWERS),
      SURVEY_QUESTIONS: tableToCollection(TABLES.SURVEY_QUESTIONS),
      SURVEY_SECTIONS: tableToCollection(TABLES.SURVEY_SECTIONS),
      SURVEYS: tableToCollection(TABLES.SURVEYS),
      COMPANIES: tableToCollection(TABLES.COMPANIES),
      PEOPLE: tableToCollection(TABLES.PEOPLE)
    }

    afterEach(async () => {
      await sql(TABLES.SURVEY_ANSWERS).whereNot('id', '').del()
      await sql(TABLES.SURVEY_QUESTIONS).whereNot('id', '').del()
      await sql(TABLES.SURVEY_SECTIONS).whereNot('id', '').del()
      await sql(TABLES.SURVEYS).whereNot('id', '').del()
      await sql(TABLES.COMPANIES).whereNot('id', '').del()
      await sql(TABLES.PEOPLE).whereNot('id', '').del()
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
                email: 'jim@bob.com'
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
                _key: 'surveyQuestion1',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                slug: 'survey-question-slug',
                title: 'Title',
                description: 'Description',
                required: true,
                type: ENUMS.QUESTION_TYPES.CONNECTIONS,
                surveySection: 'surveySection1'
              }
            ]
          },
          {
            name: COLLECTIONS.SURVEY_ANSWERS,
            data: [
              {
                _id: 'surveyAnswers/123',
                _rev: '_WpP1l3W---',
                _key: '123',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                person: 'person1',
                surveyQuestion: 'surveyQuestion1',
                batchSize: 100,
                skip: 0
              }
            ]
          }
        ])
      })

      genericExpectationsForTable(TABLES.SURVEY_ANSWERS)

      it('should remap the relations', async () => {
        const surveyAnswers = await sql.select().from(TABLES.SURVEY_ANSWERS)
        const surveyQuestions = await sql.select().from(TABLES.SURVEY_QUESTIONS)
        const people = await sql.select().from(TABLES.PEOPLE)
        expect(surveyAnswers[0]).to.have.property('surveyQuestion', surveyQuestions[0].id)
        expect(surveyAnswers[0]).to.have.property('person', people[0].id)
      })
    })
  })
})
