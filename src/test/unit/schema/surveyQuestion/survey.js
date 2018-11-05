/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('SurveyQuestion.survey', () => {
  it('should fetch filtered survey', async () => {
    const db = {
      surveyQuestions: [
        {
          id: 'surveyQuestion1',
          survey: 'survey2'
        }
      ],
      surveys: [
        {
          id: 'survey1'
        },
        {
          id: 'survey2'
        }
      ]
    }
    const operation = `
      query {
        surveyQuestion (id: "surveyQuestion1") {
          survey {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        surveyQuestion: {
          survey: {
            id: 'survey2'
          }
        }
      }
    })
  })

  it('should return null if no matches', async () => {
    const db = {
      surveyQuestions: [
        {
          id: 'surveyQuestion1',
          survey: 'survey3'
        }
      ],
      surveys: [
        {
          id: 'survey1'
        },
        {
          id: 'survey2'
        }
      ]
    }
    const operation = `
      query {
        surveyQuestion (id: "surveyQuestion1") {
          survey {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        surveyQuestion: {
          survey: null
        }
      }
    })
  })
})
