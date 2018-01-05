/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Mutation.createSurveyAnswer', () => {
  it('should create surveyAnswer', async () => {
    const db = {
      surveyAnswers: []
    }
    const operation = `
      mutation {
        createSurveyAnswer (
          surveyQuestion: "surveyQuestion1"
          person: "person1"
          connections: [
            "connection1",
            "connection2"
          ]
        ) {
          id
        }
      }
    `
    return executeQueryOnDbUsingSchema({ operation, db, schema })
      .then(() => {
        return expect(db.surveyAnswers[0]).to.deep.equal({
          id: 'newId',
          person: 'person1',
          surveyQuestion: 'surveyQuestion1',
          connections: [
            'connection1',
            'connection2'
          ]
        })
      })
  })

  it('should return created value', async () => {
    const db = {
      surveyAnswers: [],
      people: [
        {
          id: 'person1'
        }
      ]
    }
    const operation = `
      mutation {
        createSurveyAnswer (
          surveyQuestion: "surveyQuestion1"
          person: "person1"
          connections: [
            "connection1",
            "connection2"
          ]
        ) {
          id
          person {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        createSurveyAnswer: {
          id: 'newId',
          person: {
            id: 'person1'
          }
        }
      }
    })
  })
})
