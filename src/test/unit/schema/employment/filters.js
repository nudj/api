/* eslint-env mocha */
const schema = require('../../../../gql/schema')
let {
  expectTypeIsFilterableBy
} = require('../../helpers')
const DataSources = require('../../../../gql/schema/enums/data-sources')
const {
  values: DATA_SOURCES,
  name: DATA_SOURCE_TYPE
} = DataSources

const TYPE = 'Employment'
const TYPE_PLURAL = 'employments'
const ID_TYPE = 'ID'
const DUMMY_ID = '123'
const DUMMY_DATA_SOURCE = DATA_SOURCES.LINKEDIN
expectTypeIsFilterableBy = expectTypeIsFilterableBy(schema, TYPE, TYPE_PLURAL)

describe('Employment filters', () => {
  it('should be filterable by the following properties', async () => {
    await expectTypeIsFilterableBy('id', DUMMY_ID, ID_TYPE)
    await expectTypeIsFilterableBy('source', DUMMY_DATA_SOURCE, DATA_SOURCE_TYPE)
  })
})
