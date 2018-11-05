/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Survey.surveyQuestionByFilters', () => {
  const operation = `
    query {
      survey (id: "survey1") {
        surveyQuestionByFilters (filters: {
          id: "surveyQuestion2"
        }) {
          id
        }
      }
    }
  `

  it('should fetch filtered surveyQuestions', async () => {
    const db = {
      surveys: [
        {
          id: 'survey1'
        }
      ],
      surveyQuestions: [
        {
          id: 'surveyQuestion1',
          survey: 'survey2'
        },
        {
          id: 'surveyQuestion2',
          survey: 'survey1'
        }
      ]
    }
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        survey: {
          surveyQuestionByFilters: {
            id: 'surveyQuestion2'
          }
        }
      }
    })
  })

  it('should return null if surveyQuestion exists but is not child of selected survey', async () => {
    const db = {
      surveys: [
        {
          id: 'survey1'
        }
      ],
      surveyQuestions: [
        {
          id: 'surveyQuestion1',
          survey: 'survey1'
        },
        {
          id: 'surveyQuestion2',
          survey: 'survey2'
        }
      ]
    }
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        survey: {
          surveyQuestionByFilters: null
        }
      }
    })
  })

  it('should return null if no matches', async () => {
    const db = {
      surveys: [
        {
          id: 'survey1'
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
        survey: {
          surveyQuestionByFilters: null
        }
      }
    })
  })
})
