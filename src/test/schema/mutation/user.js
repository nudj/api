/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('Mutation.user', () => {
  it('should fetch the user', async () => {
    const db = {
      people: [
        {
          id: 'person1'
        },
        {
          id: 'person2'
        }
      ]
    }
    const query = `
      mutation ($person: ID!) {
        user (id: $person) {
          id
        }
      }
    `
    const variables = {
      person: 'person2'
    }
    return expect(executeQueryOnDbUsingSchema({ query, variables, db, schema })).to.eventually.deep.equal({
      data: {
        user: {
          id: 'person2'
        }
      }
    })
  })

  it('should error if no matches', async () => {
    const db = {
      people: [
        {
          id: 'person1'
        }
      ]
    }
    const query = `
      mutation ($person: ID!) {
        user (id: $person) {
          id
        }
      }
    `
    const variables = {
      person: 'person2'
    }
    return executeQueryOnDbUsingSchema({ query, variables, db, schema })
      .then(shouldRespondWithGqlError({
        message: 'Cannot return null for non-nullable field Mutation.user.',
        path: [ 'user' ]
      }))
  })
})
