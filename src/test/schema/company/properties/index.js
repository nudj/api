/* eslint-env mocha */
const schema = require('../../../../gql/schema')
const {
  expectPropertyReceivesValue,
  expectPropertyIsRequired
} = require('../../../helpers')

const TYPE = 'Company'
const TYPE_PLURAL = 'companies'
const DUMMY_ID = '123'
const DUMMY_STRING = 'abc'
const DUMMY_DATETIME = '2000-01-17T02:51:58.000+00:00'

describe('Company properties', () => {
  it('should be queriable by the following properties', async () => {
    await expectPropertyReceivesValue(schema, TYPE, TYPE_PLURAL, 'id', DUMMY_ID)
    await expectPropertyReceivesValue(schema, TYPE, TYPE_PLURAL, 'created', DUMMY_DATETIME)
    await expectPropertyReceivesValue(schema, TYPE, TYPE_PLURAL, 'modified', DUMMY_DATETIME)
    await expectPropertyReceivesValue(schema, TYPE, TYPE_PLURAL, 'name', DUMMY_STRING)
    await expectPropertyReceivesValue(schema, TYPE, TYPE_PLURAL, 'slug', DUMMY_STRING)
    await expectPropertyReceivesValue(schema, TYPE, TYPE_PLURAL, 'description', DUMMY_STRING)
    await expectPropertyReceivesValue(schema, TYPE, TYPE_PLURAL, 'mission', DUMMY_STRING)
    await expectPropertyReceivesValue(schema, TYPE, TYPE_PLURAL, 'facebook', DUMMY_STRING)
    await expectPropertyReceivesValue(schema, TYPE, TYPE_PLURAL, 'industry', DUMMY_STRING)
    await expectPropertyReceivesValue(schema, TYPE, TYPE_PLURAL, 'linkedin', DUMMY_STRING)
    await expectPropertyReceivesValue(schema, TYPE, TYPE_PLURAL, 'location', DUMMY_STRING)
    await expectPropertyReceivesValue(schema, TYPE, TYPE_PLURAL, 'logo', DUMMY_STRING)
    await expectPropertyReceivesValue(schema, TYPE, TYPE_PLURAL, 'size', DUMMY_STRING)
    await expectPropertyReceivesValue(schema, TYPE, TYPE_PLURAL, 'twitter', DUMMY_STRING)
    await expectPropertyReceivesValue(schema, TYPE, TYPE_PLURAL, 'url', DUMMY_STRING)
  })
  it('should have the following required properties', async () => {
    await expectPropertyIsRequired(schema, TYPE, TYPE_PLURAL, 'id')
    await expectPropertyIsRequired(schema, TYPE, TYPE_PLURAL, 'created')
    await expectPropertyIsRequired(schema, TYPE, TYPE_PLURAL, 'modified')
    await expectPropertyIsRequired(schema, TYPE, TYPE_PLURAL, 'name')
    await expectPropertyIsRequired(schema, TYPE, TYPE_PLURAL, 'slug')
  })
})
