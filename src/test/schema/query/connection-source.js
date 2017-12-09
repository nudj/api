/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('Query.connectionSource', () => {
  it('should fetch a single connectionSource', async () => {
    const db = {
      connectionSources: [
        {
          id: 'connectionSource1'
        },
        {
          id: 'connectionSource2'
        }
      ]
    }
    const query = `
      query ($id: ID!) {
        connectionSource(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'connectionSource2'
    }
    return expect(executeQueryOnDbUsingSchema({ query, variables, db, schema })).to.eventually.deep.equal({
      data: {
        connectionSource: {
          id: 'connectionSource2'
        }
      }
    })
  })

  it('should return null and error if no match', async () => {
    const db = {
      connectionSources: []
    }
    const query = `
      query ($id: ID!) {
        connectionSource(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'connectionSource2'
    }

    return executeQueryOnDbUsingSchema({ query, variables, db, schema })
      .then(shouldRespondWithGqlError({
        message: 'NotFound',
        path: ['connectionSource']
      }))
  })
})
