/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('Query.role', () => {
  it('should fetch a single role', async () => {
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
    const query = `
      query ($id: ID!) {
        role(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'role2'
    }
    return expect(executeQueryOnDbUsingSchema({ query, variables, db, schema })).to.eventually.deep.equal({
      data: {
        role: {
          id: 'role2'
        }
      }
    })
  })

  it('should return null and error if no match', async () => {
    const db = {
      roles: []
    }
    const query = `
      query ($id: ID!) {
        role(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'role2'
    }

    return executeQueryOnDbUsingSchema({ query, variables, db, schema })
      .then(shouldRespondWithGqlError({
        message: 'NotFound',
        path: ['role']
      }))
  })
})
