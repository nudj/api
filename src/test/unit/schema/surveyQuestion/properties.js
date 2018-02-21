/* eslint-env mocha */
const schema = require('../../../../gql/schema')
let {
  expectPropertyReceivesValue,
  expectPropertyIsRequired
} = require('../../helpers')
const { values: SURVEY_QUESTION_TYPES } = require('../../../../gql/schema/enums/survey-question-types')

const TYPE = 'SurveyQuestion'
const TYPE_PLURAL = 'surveyQuestions'
const DUMMY_ID = '123'
const DUMMY_STRING = 'abc'
const DUMMY_DATETIME = '2000-01-17T02:51:58.000+00:00'
const DUMMY_BOOLEAN = true
const DUMMY_SURVEY_QUESTION_TYPE = SURVEY_QUESTION_TYPES.COMPANIES
expectPropertyReceivesValue = expectPropertyReceivesValue(schema, TYPE, TYPE_PLURAL)
expectPropertyIsRequired = expectPropertyIsRequired(schema, TYPE, TYPE_PLURAL)

describe('SurveyQuestion properties', () => {
  it('should be queriable by the following properties', async () => {
    await expectPropertyReceivesValue('id', DUMMY_ID)
    await expectPropertyReceivesValue('created', DUMMY_DATETIME)
    await expectPropertyReceivesValue('modified', DUMMY_DATETIME)
    await expectPropertyReceivesValue('title', DUMMY_STRING)
    await expectPropertyReceivesValue('description', DUMMY_STRING)
    await expectPropertyReceivesValue('name', DUMMY_STRING)
    await expectPropertyReceivesValue('required', DUMMY_BOOLEAN)
    await expectPropertyReceivesValue('type', DUMMY_SURVEY_QUESTION_TYPE)
  })
  it('should have the following required properties', async () => {
    await expectPropertyIsRequired('id')
    await expectPropertyIsRequired('created')
    await expectPropertyIsRequired('modified')
    await expectPropertyIsRequired('title')
    await expectPropertyIsRequired('name')
    await expectPropertyIsRequired('required')
    await expectPropertyIsRequired('type')
  })
})
