/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const operation = `
  query {
    surveys {
      surveySections {
        id
      }
    }
  }
`

describe('Survey.surveySections', () => {
  it('should return the surveySections in the correct order', async () => {
    const db = {
      surveys: [
        {
          id: 'survey1',
          surveySections: JSON.stringify([
            'surveySection3',
            'surveySection1',
            'surveySection2'
          ])
        }
      ],
      surveySections: [
        {
          id: 'surveySection1',
          survey: 'survey1'
        },
        {
          id: 'surveySection2',
          survey: 'survey1'
        },
        {
          id: 'surveySection3',
          survey: 'survey2'
        }
      ]
    }
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        surveys: [
          {
            surveySections: [
              {
                id: 'surveySection3'
              },
              {
                id: 'surveySection1'
              },
              {
                id: 'surveySection2'
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
          surveySections: JSON.stringify([
            'surveySection2'
          ])
        }
      ],
      surveySections: [
        {
          id: 'surveySection1',
          survey: 'survey2'
        }
      ]
    }
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        surveys: [
          {
            surveySections: []
          }
        ]
      }
    })
  })
})
