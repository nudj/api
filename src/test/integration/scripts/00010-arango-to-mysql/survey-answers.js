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

  describe('for surveyAnswers table', () => {
    const COLLECTIONS = {
      SURVEY_ANSWERS: TABLES.SURVEY_ANSWERS,
      SURVEY_QUESTIONS: TABLES.SURVEY_QUESTIONS,
      SURVEY_SECTIONS: TABLES.SURVEY_SECTIONS,
      SURVEYS: TABLES.SURVEYS,
      COMPANIES: TABLES.COMPANIES,
      CONNECTIONS: TABLES.CONNECTIONS,
      PEOPLE: TABLES.PEOPLE
    }

    afterEach(async () => {
      await sql(TABLES.SURVEY_ANSWER_CONNECTIONS).whereNot('id', '').del()
      await sql(TABLES.SURVEY_ANSWERS).whereNot('id', '').del()
      await sql(TABLES.SURVEY_QUESTIONS).whereNot('id', '').del()
      await sql(TABLES.SURVEY_SECTIONS).whereNot('id', '').del()
      await sql(TABLES.SURVEYS).whereNot('id', '').del()
      await sql(TABLES.COMPANIES).whereNot('id', '').del()
      await sql(TABLES.CONNECTIONS).whereNot('id', '').del()
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
              },
              {
                _key: 'person2',
                created: '2019-02-01T01:02:03.456Z',
                modified: '2019-03-02T02:03:04.567Z',
                email: 'jom@bib.com'
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
            name: COLLECTIONS.CONNECTIONS,
            data: [
              {
                _key: 'connection1',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                firstName: 'Jom',
                lastName: 'Bib',
                source: ENUMS.DATA_SOURCES.LINKEDIN,
                person: 'person2',
                from: 'person1'
              }
            ]
          },
          {
            name: COLLECTIONS.SURVEY_ANSWERS,
            data: [
              {
                _id: 'surveyAnswers/surveyAnswer1',
                _rev: '_WpP1l3W---',
                _key: 'surveyAnswer1',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                person: 'person1',
                surveyQuestion: 'surveyQuestion1',
                connections: ['connection1'],
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
        const people = await sql.select().from(TABLES.PEOPLE).orderBy('created', 'asc')
        expect(surveyAnswers[0]).to.have.property('surveyQuestion', surveyQuestions[0].id)
        expect(surveyAnswers[0]).to.have.property('person', people[0].id)
        expect(surveyAnswers[0]).to.not.have.property('connections')
      })

      it('should create an edge record for each connection answer', async () => {
        const surveyAnswerConnections = await sql.select().from(TABLES.SURVEY_ANSWER_CONNECTIONS)
        const surveyAnswers = await sql.select().from(TABLES.SURVEY_ANSWERS)
        const connections = await sql.select().from(TABLES.CONNECTIONS)
        expect(surveyAnswerConnections[0]).to.have.property('surveyAnswer', surveyAnswers[0].id)
        expect(surveyAnswerConnections[0]).to.have.property('connection', connections[0].id)
      })
    })
  })
})
