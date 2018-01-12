/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Person.conversationByFilters', () => {
  const operation = `
    query testQuery ($userId: ID!, $conversationId: ID!) {
      person (id: $userId) {
        conversation: conversationByFilters(filters: {id: $conversationId}) {
          id
        }
      }
    }
  `
  it('should fetch filtered conversation', async () => {
    const db = {
      people: [
        {
          id: 'person1'
        }
      ],
      conversations: [
        {
          person: 'person1',
          id: 'conversation1'
        }
      ]
    }

    const variables = {
      userId: 'person1',
      conversationId: 'conversation1'
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
            conversation: {
              id: 'conversation1'
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
      conversations: [
        {
          person: 'person1',
          id: 'conversation1'
        }
      ]
    }

    const variables = {
      userId: 'person1',
      conversationId: 'conversation2'
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
            conversation: null
          }
        }
      })
    })
  })
})
