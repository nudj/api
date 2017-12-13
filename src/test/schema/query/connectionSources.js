/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Query.connectionSources', () => {
  it('should fetch all connectionSources', async () => {
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
      query {
        connectionSources {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        connectionSources: [
          {
            id: 'connectionSource1'
          },
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
      query {
        connectionSources {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        connectionSources: []
      }
    })
  })
})
