/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('Mutation.connection', () => {
  it('should fetch a single connection', async () => {
    const db = {
      connections: [
        {
          id: 'connection1'
        },
        {
          id: 'connection2'
        }
      ]
    }
    const mutation = `
      mutation ($id: ID!) {
        connection(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'connection2'
    }
    return expect(executeQueryOnDbUsingSchema({ mutation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        connection: {
          id: 'connection2'
        }
      }
    })
  })

  it('should return null and error if no match', async () => {
    const db = {
      connections: []
    }
    const mutation = `
      mutation ($id: ID!) {
        connection(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'connection2'
    }

    return executeQueryOnDbUsingSchema({ mutation, variables, db, schema })
      .then(shouldRespondWithGqlError({
        message: 'NotFound',
        path: ['connection']
      }))
  })
})
