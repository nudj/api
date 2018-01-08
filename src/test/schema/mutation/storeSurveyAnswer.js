/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Mutation.storeSurveyAnswer', () => {
  it('should create surveyAnswer', async () => {
    const db = {
      surveyAnswers: []
    }
    const operation = `
      mutation {
        storeSurveyAnswer (
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
          id: 'surveyAnswer1',
          person: 'person1',
          surveyQuestion: 'surveyQuestion1',
          connections: [
            'connection1',
            'connection2'
          ]
        })
      })
  })

  it('should update existing surveyAnswer', async () => {
    const db = {
      surveyAnswers: [
        {
          id: 'existingAnswer1',
          person: 'person1',
          surveyQuestion: 'existingQuestion1',
          connections: [
            'connection1'
          ]
        }
      ]
    }
    const operation = `
      mutation {
        storeSurveyAnswer (
          surveyQuestion: "existingQuestion1"
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
          id: 'existingAnswer1',
          person: 'person1',
          surveyQuestion: 'existingQuestion1',
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
        storeSurveyAnswer (
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
        storeSurveyAnswer: {
          id: 'newId',
          person: {
            id: 'person1'
          }
        }
      }
    })
  })
})
