/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Person.connectionByFilters', () => {
  const operation = `
    query testQuery ($connectionId: ID!) {
      user {
        connection: connectionByFilters(filters: {id: $connectionId}) {
          id
        }
      }
    }
  `
  it('should fetch filtered connection', async () => {
    const db = {
      people: [
        {
          id: 'person1'
        }
      ],
      connections: [
        {
          from: 'person1',
          id: 'connection1'
        }
      ]
    }

    const variables = {
      connectionId: 'connection1'
    }

    return executeQueryOnDbUsingSchema({
      operation,
      db,
      schema,
      variables
    }).then(result => {
      return expect(result).to.deep.equal({
        data: {
          user: {
            connection: {
              id: 'connection1'
            }
          }
        }
      })
    })
  })

  it('should return null if no matches', async () => {
    const db = {
      people: [
        {
          id: 'person1'
        }
      ],
      connections: [
        {
          from: 'person1',
          id: 'connection1'
        }
      ]
    }

    const variables = {
      connectionId: 'connection2'
    }

    return executeQueryOnDbUsingSchema({
      operation,
      db,
      schema,
      variables
    }).then(result => {
      return expect(result).to.deep.equal({
        data: {
          user: {
            connection: null
          }
        }
      })
    })
  })
})
