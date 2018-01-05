/* eslint-env mocha */
const chai = require('chai')
const { merge } = require('@nudj/library')
const expect = chai.expect

const schema = require('../../../gql/schema')
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
const baseData = {
  surveys: [
    {
      id: 'survey1'
    }
  ]
}

describe('Survey.surveySections', () => {
  it('should fetch all surveySections relating to the survey', async () => {
    const db = merge(baseData, {
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
    })
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        surveys: [
          {
            surveySections: [
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
    const db = merge(baseData, {
      surveySections: [
        {
          id: 'surveySection1',
          survey: 'survey2'
        }
      ]
    })
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
