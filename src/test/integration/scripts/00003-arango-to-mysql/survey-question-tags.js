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
    await script({ db, sql, nosql })
  }

  before(async () => {
    await setupCollections(db, TABLE_ORDER.map(table => tableToCollection(table)))
  })

  afterEach(async () => {
    await truncateCollections(db)
    await truncateCollections(nosql)
    await teardownCollections(nosql)
  })

  after(async () => {
    await teardownCollections(db)
  })

  describe('for surveyQuestionTags table', () => {
    const COLLECTIONS = {
      SURVEY_QUESTION_TAGS: tableToCollection(TABLES.SURVEY_QUESTION_TAGS),
      TAGS: tableToCollection(TABLES.TAGS),
      COMPANIES: tableToCollection(TABLES.COMPANIES),
      SURVEYS: tableToCollection(TABLES.SURVEYS),
      SURVEY_SECTIONS: tableToCollection(TABLES.SURVEY_SECTIONS),
      SURVEY_QUESTIONS: tableToCollection(TABLES.SURVEY_QUESTIONS)
    }

    afterEach(async () => {
      await sql(TABLES.SURVEY_QUESTION_TAGS).whereNot('id', '').del()
      await sql(TABLES.TAGS).whereNot('id', '').del()
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
                surveySections: ['surveySection1', 'surveySection2'],
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
                surveyQuestions: ['surveyQuestion1', 'surveyQuestion2'],
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
            name: COLLECTIONS.TAGS,
            data: [
              {
                _key: 'tag1',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                name: 'Tag',
                type: ENUMS.TAG_TYPES.EXPERTISE
              }
            ]
          },
          {
            name: COLLECTIONS.SURVEY_QUESTION_TAGS,
            data: [
              {
                _id: 'surveyQuestionTags/123',
                _rev: '_WpP1l3W---',
                _key: '123',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                source: ENUMS.DATA_SOURCES.MANUAL,
                surveyQuestion: 'surveyQuestion1',
                tag: 'tag1',
                batchSize: 100,
                skip: 0
              }
            ]
          }
        ])
      })

      genericExpectationsForTable(TABLES.SURVEY_QUESTION_TAGS)

      it('should transfer all scalar properties', async () => {
        const surveyQuestionTags = await sql.select().from(TABLES.SURVEY_QUESTION_TAGS)
        expect(surveyQuestionTags[0]).to.have.property('source', ENUMS.DATA_SOURCES.MANUAL)
      })

      it('should remap the relations', async () => {
        const surveyQuestionTags = await sql.select().from(TABLES.SURVEY_QUESTION_TAGS)
        const surveyQuestions = await sql.select().from(TABLES.SURVEY_QUESTIONS)
        const tags = await sql.select().from(TABLES.TAGS)
        expect(surveyQuestionTags[0]).to.have.property('surveyQuestion', surveyQuestions[0].id)
        expect(surveyQuestionTags[0]).to.have.property('tag', tags[0].id)
      })
    })
  })
})
