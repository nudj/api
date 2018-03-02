/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Query.employmentByFilters', () => {
  it('should fetch first filtered employment', async () => {
    const db = {
      employments: [
        {
          id: 'employment1'
        },
        {
          id: 'employment2'
        }
      ]
    }
    const operation = `
      query ($id: ID!) {
        employmentByFilters (filters: {
          id: $id
        }) {
          id
        }
      }
    `
    const variables = {
      id: 'employment2'
    }
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        employmentByFilters: {
          id: 'employment2'
        }
      }
    })
  })

  it('should return null if no match', async () => {
    const db = {
      employments: []
    }
    const operation = `
      query ($id: ID!) {
        employmentByFilters (filters: {
          id: $id
        }) {
          id
        }
      }
    `
    const variables = {
      id: 'employment2'
    }
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        employmentByFilters: null
      }
    })
  })
})
