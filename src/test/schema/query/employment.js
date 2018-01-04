/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('Query.employment', () => {
  it('should fetch a single employment', async () => {
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
        employment(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'employment2'
    }
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        employment: {
          id: 'employment2'
        }
      }
    })
  })

  it('should return null and error if no match', async () => {
    const db = {
      employments: []
    }
    const operation = `
      query ($id: ID!) {
        employment(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'employment2'
    }

    return executeQueryOnDbUsingSchema({ operation, variables, db, schema })
      .then(shouldRespondWithGqlError({
        message: 'NotFound',
        path: ['employment']
      }))
  })
})
