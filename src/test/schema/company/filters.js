/* eslint-env mocha */
const schema = require('../../../gql/schema')
let {
  expectTypeIsFilterableBy
} = require('../../helpers')

const TYPE = 'Company'
const TYPE_PLURAL = 'companies'
const DUMMY_ID = '123'
expectTypeIsFilterableBy = expectTypeIsFilterableBy(schema, TYPE, TYPE_PLURAL)

describe('Company filters', () => {
  it('should be filterable by the following properties', async () => {
    await expectTypeIsFilterableBy('id', DUMMY_ID)
  })
})
