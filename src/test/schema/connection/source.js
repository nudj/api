/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('Connection.connectionSource', () => {
  it('should fetch filtered connectionSource', async () => {
    const db = {
      connections: [
        {
          id: 'connection1',
          source: 'connectionSource2'
        }
      ],
      connectionSources: [
        {
          id: 'connectionSource1'
        },
        {
          id: 'connectionSource2'
        }
      ]
    }
    const operation = `
      query {
        connection (id: "connection1") {
          source {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        connection: {
          source: {
            id: 'connectionSource2'
          }
        }
      }
    })
  })

  it('should return null and error if no matches', async () => {
    const db = {
      connections: [
        {
          id: 'connection1',
          source: 'connectionSource3'
        }
      ],
      connectionSources: [
        {
          id: 'connectionSource1'
        },
        {
          id: 'connectionSource2'
        }
      ]
    }
    const operation = `
      query {
        connection (id: "connection1") {
          source {
            id
          }
        }
      }
    `
    return executeQueryOnDbUsingSchema({ operation, db, schema })
      .then(shouldRespondWithGqlError({
        message: 'NotFound',
        path: [
          'connection',
          'source'
        ]
      }))
  })
})
