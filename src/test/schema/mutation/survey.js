/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('Mutation.survey', () => {
  it('should fetch a single survey', async () => {
    const db = {
      surveys: [
        {
          id: 'survey1'
        },
        {
          id: 'survey2'
        }
      ]
    }
    const mutation = `
      mutation ($id: ID!) {
        survey(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'survey2'
    }
    return expect(executeQueryOnDbUsingSchema({ mutation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        survey: {
          id: 'survey2'
        }
      }
    })
  })

  it('should return null and error if no match', async () => {
    const db = {
      surveys: []
    }
    const mutation = `
      mutation ($id: ID!) {
        survey(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'survey2'
    }

    return executeQueryOnDbUsingSchema({ mutation, variables, db, schema })
      .then(shouldRespondWithGqlError({
        message: 'NotFound',
        path: ['survey']
      }))
  })
})
