/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Person.asAConnectionByFilters', () => {
  const operation = `
    query testQuery ($userId: ID!, $personId: ID!) {
      person (id: $userId) {
        asAConnectionByFilters(filters: { from: $personId }) {
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
        },
        {
          id: 'person2'
        }
      ],
      connections: [
        {
          person: 'person1',
          from: 'person2',
          id: 'connection1'
        }
      ]
    }

    const variables = {
      userId: 'person1',
      personId: 'person2',
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
            asAConnectionByFilters: {
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
          person: 'person1',
          from: 'person3',
          id: 'connection1'
        }
      ]
    }

    const variables = {
      userId: 'person1',
      personId: 'person2',
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
            asAConnectionByFilters: null
          }
        }
      })
    })
  })
})
