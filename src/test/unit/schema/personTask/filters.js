/* eslint-env mocha */
const schema = require('../../../../gql/schema')
let {
  expectTypeIsFilterableBy
} = require('../../helpers')

const TYPE = 'PersonTask'
const TYPE_PLURAL = 'personTasks'
const DUMMY_ID = '123'
const DUMMY_BOOLEAN = true
expectTypeIsFilterableBy = expectTypeIsFilterableBy(schema, TYPE, TYPE_PLURAL)

describe('PersonTask filters', () => {
  it('should be filterable by the following properties', async () => {
    await expectTypeIsFilterableBy('id', DUMMY_ID, 'ID')
    await expectTypeIsFilterableBy('completed', DUMMY_BOOLEAN, 'Boolean')
  })
})
