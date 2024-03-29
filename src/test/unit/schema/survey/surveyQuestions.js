/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const operation = `
  query {
    surveys {
      surveyQuestions {
        id
      }
    }
  }
`

describe('Survey.surveyQuestions', () => {
  it('should return the surveyQuestions in the correct order', async () => {
    const db = {
      surveys: [
        {
          id: 'survey1',
          surveyQuestions: JSON.stringify([
            'surveyQuestion2',
            'surveyQuestion3',
            'surveyQuestion1'
          ])
        }
      ],
      surveyQuestions: [
        {
          id: 'surveyQuestion1',
          survey: 'survey1'
        },
        {
          id: 'surveyQuestion2',
          survey: 'survey1'
        },
        {
          id: 'surveyQuestion3',
          survey: 'survey1'
        }
      ]
    }
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        surveys: [
          {
            surveyQuestions: [
              {
                id: 'surveyQuestion2'
              },
              {
                id: 'surveyQuestion3'
              },
              {
                id: 'surveyQuestion1'
              }
            ]
          }
        ]
      }
    })
  })

  it('should return empty array if no matches', async () => {
    const db = {
      surveys: [
        {
          id: 'survey1',
          surveyQuestions: JSON.stringify([
            'surveyQuestion2',
            'surveyQuestion3',
            'surveyQuestion1'
          ])
        }
      ],
      surveyQuestions: [
        {
          id: 'surveyQuestion1',
          survey: 'survey2'
        }
      ]
    }
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        surveys: [
          {
            surveyQuestions: []
          }
        ]
      }
    })
  })
})
