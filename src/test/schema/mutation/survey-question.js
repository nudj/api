/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('Mutation.surveyQuestion', () => {
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
    const mutation = `
      mutation ($id: ID!) {
        surveyQuestion(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'surveyQuestion2'
    }
    return expect(executeQueryOnDbUsingSchema({ mutation, variables, db, schema })).to.eventually.deep.equal({
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
    const mutation = `
      mutation ($id: ID!) {
        surveyQuestion(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'surveyQuestion2'
    }

    return executeQueryOnDbUsingSchema({ mutation, variables, db, schema })
      .then(shouldRespondWithGqlError({
        message: 'NotFound',
        path: ['surveyQuestion']
      }))
  })
})
