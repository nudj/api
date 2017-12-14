/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Mutation.recommendationsByFilters', () => {
  it('should fetch filtered recommendations', async () => {
    const db = {
      recommendations: [
        {
          id: 'recommendation1'
        },
        {
          id: 'recommendation2'
        }
      ]
    }
    const operation = `
      mutation {
        recommendationsByFilters(filters: {
          id: "recommendation2"
        }) {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        recommendationsByFilters: [
          {
            id: 'recommendation2'
          }
        ]
      }
    })
  })

  it('should return empty array if no matches', async () => {
    const db = {
      recommendations: []
    }
    const operation = `
      mutation {
        recommendationsByFilters(filters: {
          id: "recommendation2"
        }) {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        recommendationsByFilters: []
      }
    })
  })
})
