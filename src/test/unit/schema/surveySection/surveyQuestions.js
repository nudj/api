/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const operation = `
  query {
    surveySections {
      surveyQuestions {
        id
      }
    }
  }
`

describe('SurveySection.surveyQuestions', () => {
  it('should return the section questions in the correct order', async () => {
    const db = {
      surveySections: [
        {
          id: 'surveySection1',
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
          surveySection: 'surveySection1'
        },
        {
          id: 'surveyQuestion2',
          surveySection: 'surveySection1'
        },
        {
          id: 'surveyQuestion3',
          surveySection: 'surveySection2'
        }
      ]
    }
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        surveySections: [
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
      surveySections: [
        {
          id: 'surveySection1',
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
          surveySection: 'surveySection2'
        }
      ]
    }
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        surveySections: [
          {
            surveyQuestions: []
          }
        ]
      }
    })
  })
})
