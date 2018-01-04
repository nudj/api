/* eslint-env mocha */
const schema = require('../../../gql/schema')
let {
  expectTypeIsFilterableBy
} = require('../../helpers')

const TYPE = 'ConnectionSource'
const TYPE_PLURAL = 'connectionSources'
const DUMMY_ID = '123'
expectTypeIsFilterableBy = expectTypeIsFilterableBy(schema, TYPE, TYPE_PLURAL)

describe('ConnectionSource filters', () => {
  it('should be filterable by the following properties', async () => {
    await expectTypeIsFilterableBy('id', DUMMY_ID)
  })
})
