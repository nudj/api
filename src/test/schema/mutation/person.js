/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('Mutation.person', () => {
  it('should fetch a single person', async () => {
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
    const mutation = `
      mutation ($id: ID!) {
        person(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'person2'
    }
    return expect(executeQueryOnDbUsingSchema({ mutation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        person: {
          id: 'person2'
        }
      }
    })
  })

  it('should return null and error if no match', async () => {
    const db = {
      people: []
    }
    const mutation = `
      mutation ($id: ID!) {
        person(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'person2'
    }

    return executeQueryOnDbUsingSchema({ mutation, variables, db, schema })
      .then(shouldRespondWithGqlError({
        message: 'NotFound',
        path: ['person']
      }))
  })
})
