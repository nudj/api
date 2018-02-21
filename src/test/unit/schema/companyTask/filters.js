/* eslint-env mocha */
const schema = require('../../../../gql/schema')
let {
  expectTypeIsFilterableBy
} = require('../../helpers')

const TYPE = 'CompanyTask'
const TYPE_PLURAL = 'companyTasks'
const DUMMY_ID = '123'
const DUMMY_BOOLEAN = true
expectTypeIsFilterableBy = expectTypeIsFilterableBy(schema, TYPE, TYPE_PLURAL)

describe('CompanyTask filters', () => {
  it('should be filterable by the following properties', async () => {
    await expectTypeIsFilterableBy('id', DUMMY_ID)
    await expectTypeIsFilterableBy('completed', DUMMY_BOOLEAN)
  })
})
