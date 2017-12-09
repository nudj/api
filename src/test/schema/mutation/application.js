/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('Mutation.application', () => {
  it('should fetch a single application', async () => {
    const db = {
      applications: [
        {
          id: 'application1'
        },
        {
          id: 'application2'
        }
      ]
    }
    const mutation = `
      mutation ($id: ID!) {
        application(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'application2'
    }
    return expect(executeQueryOnDbUsingSchema({ mutation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        application: {
          id: 'application2'
        }
      }
    })
  })

  it('should return null and error if no match', async () => {
    const db = {
      applications: []
    }
    const mutation = `
      mutation ($id: ID!) {
        application(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'application2'
    }

    return executeQueryOnDbUsingSchema({ mutation, variables, db, schema })
      .then(shouldRespondWithGqlError({
        message: 'NotFound',
        path: ['application']
      }))
  })
})
