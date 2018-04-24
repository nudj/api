/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Person.conversationByFilters', () => {
  const operation = `
    query testQuery ($conversationId: ID!) {
      user {
        conversationByFilters(filters: {id: $conversationId}) {
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
          user: {
            conversationByFilters: {
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
          user: {
            conversationByFilters: null
          }
        }
      })
    })
  })
})
