/* eslint-env mocha */
const schema = require('../../../gql/schema')
let {
  expectPropertyReceivesValue,
  expectPropertyIsRequired
} = require('../../helpers')

const TYPE = 'Company'
const TYPE_PLURAL = 'companies'
const DUMMY_ID = '123'
const DUMMY_STRING = 'abc'
const DUMMY_DATETIME = '2000-01-17T02:51:58.000+00:00'
expectPropertyReceivesValue = expectPropertyReceivesValue(schema, TYPE, TYPE_PLURAL)
expectPropertyIsRequired = expectPropertyIsRequired(schema, TYPE, TYPE_PLURAL)

describe('Company properties', () => {
  it('should be queriable by the following properties', async () => {
    await expectPropertyReceivesValue('id', DUMMY_ID)
    await expectPropertyReceivesValue('created', DUMMY_DATETIME)
    await expectPropertyReceivesValue('modified', DUMMY_DATETIME)
    await expectPropertyReceivesValue('name', DUMMY_STRING)
    await expectPropertyReceivesValue('slug', DUMMY_STRING)
    await expectPropertyReceivesValue('description', DUMMY_STRING)
    await expectPropertyReceivesValue('mission', DUMMY_STRING)
    await expectPropertyReceivesValue('facebook', DUMMY_STRING)
    await expectPropertyReceivesValue('industry', DUMMY_STRING)
    await expectPropertyReceivesValue('linkedin', DUMMY_STRING)
    await expectPropertyReceivesValue('location', DUMMY_STRING)
    await expectPropertyReceivesValue('logo', DUMMY_STRING)
    await expectPropertyReceivesValue('size', DUMMY_STRING)
    await expectPropertyReceivesValue('twitter', DUMMY_STRING)
    await expectPropertyReceivesValue('url', DUMMY_STRING)
  })
  it('should have the following required properties', async () => {
    await expectPropertyIsRequired('id')
    await expectPropertyIsRequired('created')
    await expectPropertyIsRequired('modified')
    await expectPropertyIsRequired('name')
    await expectPropertyIsRequired('slug')
  })
})
