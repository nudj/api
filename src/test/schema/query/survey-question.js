/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('Query.surveyQuestion', () => {
  it('should fetch a single surveyQuestion', async () => {
    const db = {
      surveyQuestions: [
        {
          id: 'surveyQuestion1'
        },
        {
          id: 'surveyQuestion2'
        }
      ]
    }
    const query = `
      query ($id: ID!) {
        surveyQuestion(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'surveyQuestion2'
    }
    return expect(executeQueryOnDbUsingSchema({ query, variables, db, schema })).to.eventually.deep.equal({
      data: {
        surveyQuestion: {
          id: 'surveyQuestion2'
        }
      }
    })
  })

  it('should return null and error if no match', async () => {
    const db = {
      surveyQuestions: []
    }
    const query = `
      query ($id: ID!) {
        surveyQuestion(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'surveyQuestion2'
    }

    return executeQueryOnDbUsingSchema({ query, variables, db, schema })
      .then(shouldRespondWithGqlError({
        message: 'NotFound',
        path: ['surveyQuestion']
      }))
  })
})
