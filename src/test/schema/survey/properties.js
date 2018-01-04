/* eslint-env mocha */
const schema = require('../../../gql/schema')
let {
  expectPropertyReceivesValue,
  expectPropertyIsRequired
} = require('../../helpers')

const TYPE = 'Survey'
const TYPE_PLURAL = 'surveys'
const DUMMY_ID = '123'
const DUMMY_STRING = 'abc'
const DUMMY_DATETIME = '2000-01-17T02:51:58.000+00:00'
expectPropertyReceivesValue = expectPropertyReceivesValue(schema, TYPE, TYPE_PLURAL)
expectPropertyIsRequired = expectPropertyIsRequired(schema, TYPE, TYPE_PLURAL)

describe('Survey properties', () => {
  it('should be queriable by the following properties', async () => {
    await expectPropertyReceivesValue('id', DUMMY_ID)
    await expectPropertyReceivesValue('created', DUMMY_DATETIME)
    await expectPropertyReceivesValue('modified', DUMMY_DATETIME)
    await expectPropertyReceivesValue('slug', DUMMY_STRING)
    await expectPropertyReceivesValue('introTitle', DUMMY_STRING)
    await expectPropertyReceivesValue('introDescription', DUMMY_STRING)
    await expectPropertyReceivesValue('outroTitle', DUMMY_STRING)
    await expectPropertyReceivesValue('outroDescription', DUMMY_STRING)
  })
  it('should have the following required properties', async () => {
    await expectPropertyIsRequired('id')
    await expectPropertyIsRequired('created')
    await expectPropertyIsRequired('modified')
    await expectPropertyIsRequired('slug')
  })
})
