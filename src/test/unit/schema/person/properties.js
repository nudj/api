/* eslint-env mocha */
const schema = require('../../../../gql/schema')
let {
  expectPropertyReceivesValue,
  expectPropertyIsRequired
} = require('../../helpers')

const TYPE = 'Person'
const TYPE_PLURAL = 'people'
const DUMMY_ID = '123'
const DUMMY_STRING = 'abc'
const DUMMY_DATETIME = '2000-01-17T02:51:58.000+00:00'
const DUMMY_BOOLEAN = true
expectPropertyReceivesValue = expectPropertyReceivesValue(schema, TYPE, TYPE_PLURAL)
expectPropertyIsRequired = expectPropertyIsRequired(schema, TYPE, TYPE_PLURAL)

describe('Person properties', () => {
  it('should be queriable by the following properties', async () => {
    await expectPropertyReceivesValue('id', DUMMY_ID)
    await expectPropertyReceivesValue('created', DUMMY_DATETIME)
    await expectPropertyReceivesValue('modified', DUMMY_DATETIME)
    await expectPropertyReceivesValue('email', DUMMY_STRING)
    await expectPropertyReceivesValue('firstName', DUMMY_STRING)
    await expectPropertyReceivesValue('lastName', DUMMY_STRING)
    await expectPropertyReceivesValue('url', DUMMY_STRING)
    await expectPropertyReceivesValue('signedUp', DUMMY_BOOLEAN)
    await expectPropertyReceivesValue('acceptedTerms', DUMMY_BOOLEAN)
  })
  it('should have the following required properties', async () => {
    await expectPropertyIsRequired('id')
    await expectPropertyIsRequired('created')
    await expectPropertyIsRequired('modified')
    await expectPropertyIsRequired('email')
  })
})
