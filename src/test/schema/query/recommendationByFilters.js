/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Query.recommendationByFilters', () => {
  it('should fetch first filtered recommendation', async () => {
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
      query ($id: ID!) {
        recommendationByFilters (filters: {
          id: $id
        }) {
          id
        }
      }
    `
    const variables = {
      id: 'recommendation2'
    }
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        recommendationByFilters: {
          id: 'recommendation2'
        }
      }
    })
  })

  it('should return null if no match', async () => {
    const db = {
      recommendations: []
    }
    const operation = `
      query ($id: ID!) {
        recommendationByFilters (filters: {
          id: $id
        }) {
          id
        }
      }
    `
    const variables = {
      id: 'recommendation2'
    }
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        recommendationByFilters: null
      }
    })
  })
})
