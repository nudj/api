/* eslint-env mocha */
const chai = require('chai')
const { merge } = require('@nudj/library')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const operation = `
  query {
    companies {
      surveyOrDefault {
        id
        slug
      }
    }
  }
`
const baseData = {
  companies: [
    {
      id: 'company1'
    }
  ],
  surveys: [
    {
      id: 'survey1',
      slug: 'real-survey'
    },
    {
      id: 'survey2',
      slug: 'default'
    }
  ]
}

describe('Company.surveyOrDefault', () => {
  it('should fetch the survey related to the company', async () => {
    const db = merge(baseData, {
      companySurveys: [
        {
          id: 'companySurvey1',
          company: 'company1',
          survey: 'survey1'
        }
      ]
    })
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        companies: [
          {
            surveyOrDefault: {
              id: 'survey1',
              slug: 'real-survey'
            }
          }
        ]
      }
    })
  })

  it('should return default survey if no matches', async () => {
    const db = merge(baseData, {
      surveys: [
        {
          id: 'survey1',
          company: 'company2'
        }
      ]
    })
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        companies: [
          {
            surveyOrDefault: {
              id: 'survey2',
              slug: 'default'
            }
          }
        ]
      }
    })
  })
})
