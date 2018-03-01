/* eslint-env mocha */
const chai = require('chai')
const dedent = require('dedent')
const expect = chai.expect

const { parseFiltersToAql } = require('../../../../gql/lib/aql')

describe('parseFiltersToAql', () => {
  it('formats a basic filters object to an AQL string', () => {
    const filters = { name: 'dave' }
    const aql = parseFiltersToAql(filters)
    expect(dedent(aql)).to.deep.equal(dedent`
      FILTER item.name == "dave"
    `)
  })

  it('formats a multi-filter object to an AQL string', () => {
    const filters = { name: 'dave', status: 'active' }
    const aql = parseFiltersToAql(filters)
    expect(dedent(aql)).to.deep.equal(dedent`
      FILTER item.name == "dave" && item.status == "active"
    `)
  })

  it('returns an empty string for an empty object', () => {
    const aql = parseFiltersToAql({})
    expect(dedent(aql)).to.deep.equal('')
  })

  it('returns an empty string for a missing filter', () => {
    const aql = parseFiltersToAql()
    expect(dedent(aql)).to.deep.equal('')
  })
})
