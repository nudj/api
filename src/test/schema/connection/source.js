/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('Connection.source', () => {
  it('should fetch filtered source', async () => {
    const db = {
      connections: [
        {
          id: 'connection1',
          source: 'source2'
        }
      ],
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
            id: 'source2'
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
          source: 'source3'
        }
      ],
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
