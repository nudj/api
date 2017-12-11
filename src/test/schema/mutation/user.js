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
    const operation = `
      mutation ($person: ID!) {
        user (id: $person) {
          id
        }
      }
    `
    const variables = {
      person: 'person2'
    }
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        user: {
          id: 'person2'
        }
      }
    })
  })

  it('should return null if no match', async () => {
    const db = {
      people: [
        {
          id: 'person1'
        }
      ]
    }
    const operation = `
      mutation ($person: ID!) {
        user (id: $person) {
          id
        }
      }
    `
    const variables = {
      person: 'person2'
    }

    return executeQueryOnDbUsingSchema({ operation, variables, db, schema })
      .then(shouldRespondWithGqlError({
        message: 'NotFound',
        path: ['user']
      }))
  })
})
