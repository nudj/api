/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('Mutation.surveyQuestionByFilters', () => {
  it('should fetch first filtered surveyQuestion', async () => {
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
    const operation = `
      mutation ($id: ID!) {
        surveyQuestionByFilters (filters: {
          id: $id
        }) {
          id
        }
      }
    `
    const variables = {
      id: 'surveyQuestion2'
    }
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        surveyQuestionByFilters: {
          id: 'surveyQuestion2'
        }
      }
    })
  })

  it('should return null and error if no match', async () => {
    const db = {
      surveyQuestions: []
    }
    const operation = `
      mutation ($id: ID!) {
        surveyQuestionByFilters (filters: {
          id: $id
        }) {
          id
        }
      }
    `
    const variables = {
      id: 'surveyQuestion2'
    }
    return executeQueryOnDbUsingSchema({ operation, variables, db, schema })
      .then(shouldRespondWithGqlError({
        message: 'NotFound',
        path: ['surveyQuestionByFilters']
      }))
  })
})
