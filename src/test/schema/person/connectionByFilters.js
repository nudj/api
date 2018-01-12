/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Person.connectionByFilters', () => {
  const operation = `
    query testQuery ($userId: ID!, $connectionId: ID!) {
      person (id: $userId) {
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
      userId: 'person1',
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
          person: {
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
      userId: 'person1',
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
          person: {
            connection: null
          }
        }
      })
    })
  })
})
