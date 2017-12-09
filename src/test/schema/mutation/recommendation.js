/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('Mutation.recommendation', () => {
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
    const mutation = `
      mutation ($id: ID!) {
        recommendation(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'recommendation2'
    }
    return expect(executeQueryOnDbUsingSchema({ mutation, variables, db, schema })).to.eventually.deep.equal({
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
    const mutation = `
      mutation ($id: ID!) {
        recommendation(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'recommendation2'
    }

    return executeQueryOnDbUsingSchema({ mutation, variables, db, schema })
      .then(shouldRespondWithGqlError({
        message: 'NotFound',
        path: ['recommendation']
      }))
  })
})
