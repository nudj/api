/* eslint-env mocha */
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')

const { fetchAll } = require('../../../../lib')
const {
  db,
  setupCollections,
  populateCollections,
  truncateCollections,
  teardownCollections,
  expect
} = require('../../lib')
const script = require('../../../../scripts/00011-remove-company-questions')
const executeScript = () => script({ db })

chai.use(chaiAsPromised)

describe('00011 Remove company questions', () => {
  before(async () => {
    await setupCollections(db, [
      'surveys',
      'surveyQuestions'
    ])
  })

  beforeEach(async () => {
    await populateCollections(db, [
      {
        name: 'surveys',
        data: [
          {
            _key: 'survey1',
            surveyQuestions: [
              'surveyQuestion1',
              'surveyQuestion2'
            ]
          }
        ]
      },
      {
        name: 'surveyQuestions',
        data: [
          {
            _key: 'surveyQuestion1',
            survey: 'survey1',
            type: 'COMPANIES'
          },
          {
            _key: 'surveyQuestion2',
            survey: 'survey1',
            type: 'CONNECTIONS'
          }
        ]
      }
    ])
    await executeScript()
  })

  afterEach(async () => {
    await truncateCollections(db)
  })

  after(async () => {
    await teardownCollections(db)
  })

  it('should remove the surveyQuestion', async () => {
    const surveyQuestions = await fetchAll(db, 'surveyQuestions')
    expect(surveyQuestions).to.have.length(1)
  })

  it('should remove the surveyQuestion key from Survey.surveyQuestions order cache', async () => {
    const surveys = await fetchAll(db, 'surveys')
    expect(surveys[0]).to.have.property('surveyQuestions').to.deep.equal(['surveyQuestion2'])
  })
})
