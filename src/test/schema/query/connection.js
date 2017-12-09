/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('Query.connection', () => {
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
    const query = `
      query ($id: ID!) {
        connection(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'connection2'
    }
    return expect(executeQueryOnDbUsingSchema({ query, variables, db, schema })).to.eventually.deep.equal({
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
    const query = `
      query ($id: ID!) {
        connection(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'connection2'
    }

    return executeQueryOnDbUsingSchema({ query, variables, db, schema })
      .then(shouldRespondWithGqlError({
        message: 'NotFound',
        path: ['connection']
      }))
  })
})
