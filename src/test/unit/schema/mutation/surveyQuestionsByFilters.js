/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Mutation.surveyQuestionsByFilters', () => {
  it('should fetch filtered surveyQuestions', async () => {
    const db = {
      surveyQuestions: [
        {
          id: 'surveyQuestion1'
        },
        {
          id: 'surveyQuestion2'
        }
      ]
    }
    const operation = `
      mutation {
        surveyQuestionsByFilters(filters: {
          id: "surveyQuestion2"
        }) {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        surveyQuestionsByFilters: [
          {
            id: 'surveyQuestion2'
          }
        ]
      }
    })
  })

  it('should return empty array if no matches', async () => {
    const db = {
      surveyQuestions: []
    }
    const operation = `
      mutation {
        surveyQuestionsByFilters(filters: {
          id: "surveyQuestion2"
        }) {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        surveyQuestionsByFilters: []
      }
    })
  })
})
