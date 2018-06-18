/* eslint-env mocha */
const schema = require('../../../../gql/schema')
let {
  expectPropertyReceivesValue,
  expectPropertyIsRequired,
  expectPropertyContentsIsRequired
} = require('../../helpers')
const { values: statusTypes } = require('../../../../gql/schema/enums/job-status-types')

const TYPE = 'Job'
const TYPE_PLURAL = 'jobs'
const DUMMY_ID = '123'
const DUMMY_STRING = 'abc'
const DUMMY_DATETIME = '2000-01-17T02:51:58.000+00:00'
const DUMMY_ARRAY_STRINGS = ['abc']
const DUMMY_STATUS = statusTypes.PUBLISHED
expectPropertyReceivesValue = expectPropertyReceivesValue(schema, TYPE, TYPE_PLURAL)
expectPropertyIsRequired = expectPropertyIsRequired(schema, TYPE, TYPE_PLURAL)
expectPropertyContentsIsRequired = expectPropertyContentsIsRequired(schema, TYPE, TYPE_PLURAL)

describe('Job properties', () => {
  it('should be queriable by the following properties', async () => {
    await expectPropertyReceivesValue('id', DUMMY_ID)
    await expectPropertyReceivesValue('created', DUMMY_DATETIME)
    await expectPropertyReceivesValue('modified', DUMMY_DATETIME)
    await expectPropertyReceivesValue('title', DUMMY_STRING)
    await expectPropertyReceivesValue('slug', DUMMY_STRING)
    await expectPropertyReceivesValue('description', DUMMY_STRING)
    await expectPropertyReceivesValue('bonus', DUMMY_STRING)
    await expectPropertyReceivesValue('roleDescription', DUMMY_STRING)
    await expectPropertyReceivesValue('candidateDescription', DUMMY_STRING)
    await expectPropertyReceivesValue('location', DUMMY_STRING)
    await expectPropertyReceivesValue('remuneration', DUMMY_STRING)
    await expectPropertyReceivesValue('status', DUMMY_STATUS)
    await expectPropertyReceivesValue('templateTags', DUMMY_ARRAY_STRINGS)
    await expectPropertyReceivesValue('type', DUMMY_STRING)
    await expectPropertyReceivesValue('url', DUMMY_STRING)
    await expectPropertyReceivesValue('experience', DUMMY_STRING)
    await expectPropertyReceivesValue('requirements', DUMMY_STRING)
  })
  it('should have the following required properties', async () => {
    await expectPropertyIsRequired('id')
    await expectPropertyIsRequired('created')
    await expectPropertyIsRequired('modified')
    await expectPropertyIsRequired('title')
    await expectPropertyIsRequired('slug')
    await expectPropertyIsRequired('location')
    await expectPropertyIsRequired('status')
    await expectPropertyIsRequired('templateTags')
    await expectPropertyContentsIsRequired('templateTags')
    await expectPropertyIsRequired('type')
  })
})
