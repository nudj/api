/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('Query.recommendation', () => {
  it('should fetch a single recommendation', async () => {
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
        recommendation(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'recommendation2'
    }
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        recommendation: {
          id: 'recommendation2'
        }
      }
    })
  })

  it('should return null and error if no match', async () => {
    const db = {
      recommendations: []
    }
    const operation = `
      query ($id: ID!) {
        recommendation(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'recommendation2'
    }

    return executeQueryOnDbUsingSchema({ operation, variables, db, schema })
      .then(shouldRespondWithGqlError({
        message: 'NotFound',
        path: ['recommendation']
      }))
  })
})
