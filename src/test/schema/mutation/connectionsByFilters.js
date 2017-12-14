/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Mutation.connectionsByFilters', () => {
  it('should fetch filtered connections', async () => {
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
    const operation = `
      mutation {
        connectionsByFilters(filters: {
          id: "connection2"
        }) {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        connectionsByFilters: [
          {
            id: 'connection2'
          }
        ]
      }
    })
  })

  it('should return empty array if no matches', async () => {
    const db = {
      connections: []
    }
    const operation = `
      mutation {
        connectionsByFilters(filters: {
          id: "connection2"
        }) {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        connectionsByFilters: []
      }
    })
  })
})
