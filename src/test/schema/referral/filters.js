/* eslint-env mocha */
const schema = require('../../../gql/schema')
let {
  expectTypeIsFilterableBy
} = require('../../helpers')

const TYPE = 'Referral'
const TYPE_PLURAL = 'referrals'
const DUMMY_ID = '123'
expectTypeIsFilterableBy = expectTypeIsFilterableBy(schema, TYPE, TYPE_PLURAL)

describe('Referral filters', () => {
  it('should be filterable by the following properties', async () => {
    await expectTypeIsFilterableBy('id', DUMMY_ID)
    await expectTypeIsFilterableBy('person', DUMMY_ID)
  })
})
