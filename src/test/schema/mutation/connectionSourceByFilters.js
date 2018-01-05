/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('Mutation.sourceByFilters', () => {
  it('should fetch first filtered source', async () => {
    const db = {
      sources: [
        {
          id: 'source1'
        },
        {
          id: 'source2'
        }
      ]
    }
    const operation = `
      mutation ($id: ID!) {
        sourceByFilters (filters: {
          id: $id
        }) {
          id
        }
      }
    `
    const variables = {
      id: 'source2'
    }
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        sourceByFilters: {
          id: 'source2'
        }
      }
    })
  })

  it('should return null and error if no match', async () => {
    const db = {
      sources: []
    }
    const operation = `
      mutation ($id: ID!) {
        sourceByFilters (filters: {
          id: $id
        }) {
          id
        }
      }
    `
    const variables = {
      id: 'source2'
    }
    return executeQueryOnDbUsingSchema({ operation, variables, db, schema })
      .then(shouldRespondWithGqlError({
        message: 'NotFound',
        path: ['sourceByFilters']
      }))
  })
})
