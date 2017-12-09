/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Mutation.surveyQuestions', () => {
  it('should fetch all surveyQuestions', async () => {
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
    const mutation = `
      mutation {
        surveyQuestions {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ mutation, db, schema })).to.eventually.deep.equal({
      data: {
        surveyQuestions: [
          {
            id: 'surveyQuestion1'
          },
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
    const mutation = `
      mutation {
        surveyQuestions {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ mutation, db, schema })).to.eventually.deep.equal({
      data: {
        surveyQuestions: []
      }
    })
  })
})
