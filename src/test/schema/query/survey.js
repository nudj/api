/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('Query.survey', () => {
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
    const query = `
      query ($id: ID!) {
        survey(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'survey2'
    }
    return expect(executeQueryOnDbUsingSchema({ query, variables, db, schema })).to.eventually.deep.equal({
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
    const query = `
      query ($id: ID!) {
        survey(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'survey2'
    }

    return executeQueryOnDbUsingSchema({ query, variables, db, schema })
      .then(shouldRespondWithGqlError({
        message: 'NotFound',
        path: ['survey']
      }))
  })
})
