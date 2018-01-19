/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('SurveyQuestion.surveySection', () => {
  it('should fetch filtered surveySection', async () => {
    const db = {
      surveyQuestions: [
        {
          id: 'surveyQuestion1',
          surveySection: 'surveySection2'
        }
      ],
      surveySections: [
        {
          id: 'surveySection1'
        },
        {
          id: 'surveySection2'
        }
      ]
    }
    const operation = `
      query {
        surveyQuestion (id: "surveyQuestion1") {
          surveySection {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        surveyQuestion: {
          surveySection: {
            id: 'surveySection2'
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
          surveySection: 'surveySection3'
        }
      ],
      surveySections: [
        {
          id: 'surveySection1'
        },
        {
          id: 'surveySection2'
        }
      ]
    }
    const operation = `
      query {
        surveyQuestion (id: "surveyQuestion1") {
          surveySection {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        surveyQuestion: {
          surveySection: null
        }
      }
    })
  })
})
