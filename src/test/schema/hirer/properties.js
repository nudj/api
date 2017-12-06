/* eslint-env mocha */
const schema = require('../../../gql/schema')
const {
  expectPropertyReceivesValue,
  expectPropertyIsRequired
} = require('../../helpers')

const TYPE = 'Hirer'
const TYPE_PLURAL = 'hirers'
const DUMMY_ID = '123'

describe('Company properties', () => {
  it('should be queriable by the following properties', async () => {
    await expectPropertyReceivesValue(schema, TYPE, TYPE_PLURAL, 'id', DUMMY_ID)
  })
  it('should have the following required properties', async () => {
    await expectPropertyIsRequired(schema, TYPE, TYPE_PLURAL, 'id')
  })
})
