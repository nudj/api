/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Query.recommendationsByFilters', () => {
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
      query {
        recommendationsByFilters {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        recommendationsByFilters: [
          {
            id: 'recommendation1'
          },
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
      query {
        recommendationsByFilters {
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
