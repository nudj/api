/* eslint-env mocha */
const chai = require('chai')
const { merge } = require('@nudj/library')
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
const baseData = {
  surveySections: [
    {
      id: 'surveySection1'
    }
  ]
}

describe('SurveySection.surveyQuestions', () => {
  it('should fetch all surveyQuestions relating to the surveySection', async () => {
    const db = merge(baseData, {
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
    })
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        surveySections: [
          {
            surveyQuestions: [
              {
                id: 'surveyQuestion1'
              },
              {
                id: 'surveyQuestion2'
              }
            ]
          }
        ]
      }
    })
  })

  it('should return empty array if no matches', async () => {
    const db = merge(baseData, {
      surveyQuestions: [
        {
          id: 'surveyQuestion1',
          surveySection: 'surveySection2'
        }
      ]
    })
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
