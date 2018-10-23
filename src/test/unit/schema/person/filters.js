/* eslint-env mocha */
const schema = require('../../../../gql/schema')
let {
  expectTypeIsFilterableBy
} = require('../../helpers')

const TYPE = 'Person'
const TYPE_PLURAL = 'people'
const DUMMY_ID = '123'
const DUMMY_STRING = 'abc'
const DUMMY_BOOLEAN = true
expectTypeIsFilterableBy = expectTypeIsFilterableBy(schema, TYPE, TYPE_PLURAL)

describe('Person filters', () => {
  it('should be filterable by the following properties', async () => {
    await expectTypeIsFilterableBy('id', DUMMY_ID, 'ID')
    await expectTypeIsFilterableBy('email', DUMMY_STRING, 'String')
    await expectTypeIsFilterableBy('signedUp', DUMMY_BOOLEAN, 'Boolean')
    await expectTypeIsFilterableBy('acceptedTerms', DUMMY_BOOLEAN, 'Boolean')
  })
})
