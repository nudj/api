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

  describe('for surveys table', () => {
    const COLLECTIONS = {
      SURVEYS: TABLES.SURVEYS,
      SURVEY_QUESTIONS: TABLES.SURVEY_QUESTIONS,
      COMPANIES: TABLES.COMPANIES
    }

    afterEach(async () => {
      await sql(TABLES.SURVEY_QUESTIONS).whereNot('id', '').del()
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
                surveyQuestions: ['surveyQuestion1'],
                batchSize: 100,
                skip: 0
              }
            ]
          },
          {
            name: COLLECTIONS.SURVEY_QUESTIONS,
            data: [
              {
                _id: 'surveyQuestions/surveyQuestion1',
                _rev: '_WpP1l3W---',
                _key: 'surveyQuestion1',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                survey: '123',
                name: 'previous-companies',
                description: 'Intro description',
                required: true,
                title: 'Where did you work before?',
                type: 'COMPANIES'
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
        const surveyQuestions = await sql.select().from(TABLES.SURVEY_QUESTIONS)
        expect(surveys[0]).to.have.property('surveyQuestions', JSON.stringify([surveyQuestions[0].id]))
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
                surveyQuestions: ['surveyQuestion1'],
                batchSize: 100,
                skip: 0
              }
            ]
          },
          {
            name: COLLECTIONS.SURVEY_QUESTIONS,
            data: [
              {
                _id: 'surveyQuestions/surveyQuestion1',
                _rev: '_WpP1l3W---',
                _key: 'surveyQuestion1',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                survey: '123',
                name: 'previous-companies',
                description: 'Intro description',
                required: true,
                title: 'Where did you work before?',
                type: 'COMPANIES'
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
