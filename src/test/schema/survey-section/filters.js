/* eslint-env mocha */
const schema = require('../../../gql/schema')
let {
  expectTypeIsFilterableBy
} = require('../../helpers')

const TYPE = 'SurveySection'
const TYPE_PLURAL = 'surveySections'
const DUMMY_ID = '123'
expectTypeIsFilterableBy = expectTypeIsFilterableBy(schema, TYPE, TYPE_PLURAL)

describe('SurveySection filters', () => {
  it('should be filterable by the following properties', async () => {
    await expectTypeIsFilterableBy('id', DUMMY_ID)
  })
})
