/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

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
    const operation = `
      query ($id: ID!) {
        connection(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'connection2'
    }
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        connection: {
          id: 'connection2'
        }
      }
    })
  })

  it('should return null if no match', async () => {
    const db = {
      connections: []
    }
    const operation = `
      query ($id: ID!) {
        connection(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'connection2'
    }

    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        connection: null
      }
    })
  })
})
