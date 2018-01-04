/* eslint-env mocha */
const schema = require('../../../gql/schema')
let {
  expectPropertyReceivesValue,
  expectPropertyIsRequired
} = require('../../helpers')

const TYPE = 'PersonTask'
const TYPE_PLURAL = 'personTasks'
const DUMMY_ID = '123'
const DUMMY_DATETIME = '2000-01-17T02:51:58.000+00:00'
const DUMMY_BOOLEAN = true
const DUMMY_STRING = 'fhewgrewgrenij'
expectPropertyReceivesValue = expectPropertyReceivesValue(schema, TYPE, TYPE_PLURAL)
expectPropertyIsRequired = expectPropertyIsRequired(schema, TYPE, TYPE_PLURAL)

describe('PersonTask properties', () => {
  it('should be queriable by the following properties', async () => {
    await expectPropertyReceivesValue('id', DUMMY_ID)
    await expectPropertyReceivesValue('created', DUMMY_DATETIME)
    await expectPropertyReceivesValue('modified', DUMMY_DATETIME)
    await expectPropertyReceivesValue('completed', DUMMY_BOOLEAN)
    await expectPropertyReceivesValue('type', DUMMY_STRING)
  })
  it('should have the following required properties', async () => {
    await expectPropertyIsRequired('id')
    await expectPropertyIsRequired('created')
    await expectPropertyIsRequired('modified')
    await expectPropertyIsRequired('completed')
    await expectPropertyIsRequired('type')
  })
})
