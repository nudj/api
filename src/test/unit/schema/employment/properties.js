/* eslint-env mocha */
const schema = require('../../../../gql/schema')
let {
  expectPropertyReceivesValue,
  expectPropertyIsRequired
} = require('../../helpers')
const { values: dataSources } = require('../../../../gql/schema/enums/data-sources')

const TYPE = 'Employment'
const TYPE_PLURAL = 'employments'
const DUMMY_ID = '123'
const DUMMY_DATETIME = '2000-01-17T02:51:58.000+00:00'
const DUMMY_DATA_SOURCE = dataSources.LINKEDIN
expectPropertyReceivesValue = expectPropertyReceivesValue(schema, TYPE, TYPE_PLURAL)
expectPropertyIsRequired = expectPropertyIsRequired(schema, TYPE, TYPE_PLURAL)

describe('Employment properties', () => {
  it('should be queriable by the following properties', async () => {
    await expectPropertyReceivesValue('id', DUMMY_ID)
    await expectPropertyReceivesValue('created', DUMMY_DATETIME)
    await expectPropertyReceivesValue('modified', DUMMY_DATETIME)
    await expectPropertyReceivesValue('source', DUMMY_DATA_SOURCE)
  })
  it('should have the following required properties', async () => {
    await expectPropertyIsRequired('id')
    await expectPropertyIsRequired('created')
    await expectPropertyIsRequired('modified')
    await expectPropertyIsRequired('source')
  })
})
