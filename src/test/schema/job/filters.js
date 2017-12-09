/* eslint-env mocha */
const schema = require('../../../gql/schema')
let {
  expectTypeIsFilterableBy
} = require('../../helpers')

const TYPE = 'Job'
const TYPE_PLURAL = 'jobs'
const DUMMY_ID = '123'
const DUMMY_STRING = 'abc'
expectTypeIsFilterableBy = expectTypeIsFilterableBy(schema, TYPE, TYPE_PLURAL)

describe('Job filters', () => {
  it('should be filterable by the following properties', async () => {
    await expectTypeIsFilterableBy('id', DUMMY_ID)
    await expectTypeIsFilterableBy('slug', DUMMY_STRING)
  })
})
