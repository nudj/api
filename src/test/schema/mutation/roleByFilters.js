/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('Mutation.roleByFilters', () => {
  it('should fetch first filtered role', async () => {
    const db = {
      roles: [
        {
          id: 'role1'
        },
        {
          id: 'role2'
        }
      ]
    }
    const operation = `
      mutation ($id: ID!) {
        roleByFilters (filters: {
          id: $id
        }) {
          id
        }
      }
    `
    const variables = {
      id: 'role2'
    }
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        roleByFilters: {
          id: 'role2'
        }
      }
    })
  })

  it('should return null and error if no match', async () => {
    const db = {
      roles: []
    }
    const operation = `
      mutation ($id: ID!) {
        roleByFilters (filters: {
          id: $id
        }) {
          id
        }
      }
    `
    const variables = {
      id: 'role2'
    }
    return executeQueryOnDbUsingSchema({ operation, variables, db, schema })
      .then(shouldRespondWithGqlError({
        message: 'NotFound',
        path: ['roleByFilters']
      }))
  })
})
