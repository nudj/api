/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('SurveySection.survey', () => {
  it('should fetch filtered survey', async () => {
    const db = {
      surveySections: [
        {
          id: 'surveySection1',
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
        surveySection (id: "surveySection1") {
          survey {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        surveySection: {
          survey: {
            id: 'survey2'
          }
        }
      }
    })
  })

  it('should return null if no matches', async () => {
    const db = {
      surveySections: [
        {
          id: 'surveySection1',
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
        surveySection (id: "surveySection1") {
          survey {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        surveySection: {
          survey: null
        }
      }
    })
  })
})
