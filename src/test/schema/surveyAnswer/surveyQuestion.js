/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('SurveyAnswer.surveyQuestion', () => {
  it('should fetch filtered question', async () => {
    const db = {
      surveyAnswers: [
        {
          id: 'surveyAnswer1',
          surveyQuestion: 'surveyQuestion1'
        }
      ],
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
      query {
        surveyAnswer (id: "surveyAnswer1") {
          surveyQuestion {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        surveyAnswer: {
          surveyQuestion: {
            id: 'surveyQuestion1'
          }
        }
      }
    })
  })

  it('should return null and error if no matches', async () => {
    const db = {
      surveyAnswers: [
        {
          id: 'surveyAnswer1',
          surveyQuestion: 'surveyQuestion3'
        }
      ],
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
      query {
        surveyAnswer (id: "surveyAnswer1") {
          surveyQuestion {
            id
          }
        }
      }
    `
    return executeQueryOnDbUsingSchema({ operation, db, schema })
      .then(shouldRespondWithGqlError({
        message: 'NotFound',
        path: [
          'surveyAnswer',
          'surveyQuestion'
        ]
      }))
  })
})
