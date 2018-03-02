/* eslint-env mocha */
const schema = require('../../../../gql/schema')
let {
  expectTypeIsFilterableBy
} = require('../../helpers')

const TYPE = 'Company'
const TYPE_PLURAL = 'companies'
const DUMMY_ID = '123'
const DUMMY_STRING = 'abc'
expectTypeIsFilterableBy = expectTypeIsFilterableBy(schema, TYPE, TYPE_PLURAL)

describe('Company filters', () => {
  it('should be filterable by the following properties', async () => {
    await expectTypeIsFilterableBy('id', DUMMY_ID, 'ID')
    await expectTypeIsFilterableBy('slug', DUMMY_STRING, 'String')
  })
})
