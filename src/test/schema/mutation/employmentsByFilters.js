/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Mutation.employmentsByFilters', () => {
  it('should fetch filtered employments', async () => {
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
      mutation {
        employmentsByFilters(filters: {
          id: "employment2"
        }) {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        employmentsByFilters: [
          {
            id: 'employment2'
          }
        ]
      }
    })
  })

  it('should return empty array if no matches', async () => {
    const db = {
      employments: []
    }
    const operation = `
      mutation {
        employmentsByFilters(filters: {
          id: "employment2"
        }) {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        employmentsByFilters: []
      }
    })
  })
})
