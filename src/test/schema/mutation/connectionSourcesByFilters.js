/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Mutation.connectionSourcesByFilters', () => {
  it('should fetch filtered connectionSources', async () => {
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
    const operation = `
      mutation {
        connectionSourcesByFilters(filters: {
          id: "connectionSource2"
        }) {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        connectionSourcesByFilters: [
          {
            id: 'connectionSource2'
          }
        ]
      }
    })
  })

  it('should return empty array if no matches', async () => {
    const db = {
      connectionSources: []
    }
    const operation = `
      mutation {
        connectionSourcesByFilters(filters: {
          id: "connectionSource2"
        }) {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        connectionSourcesByFilters: []
      }
    })
  })
})
