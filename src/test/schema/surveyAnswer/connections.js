/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('SurveyAnswer.connections', () => {
  it('should fetch filtered connections', async () => {
    const db = {
      surveyAnswers: [
        {
          id: 'surveyAnswer1',
          connections: [ 'connection1', 'connection2' ]
        }
      ],
      connections: [
        {
          id: 'connection1'
        },
        {
          id: 'connection2'
        },
        {
          id: 'connection3'
        }
      ]
    }
    const operation = `
      query {
        surveyAnswer (id: "surveyAnswer1") {
          connections {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        surveyAnswer: {
          connections: [
            {
              id: 'connection1'
            },
            {
              id: 'connection2'
            }

          ]
        }
      }
    })
  })

  it('should return null if no matches', async () => {
    const db = {
      surveyAnswers: [
        {
          id: 'surveyAnswer1',
          connections: [ 'connection3' ]
        }
      ],
      connections: [
        {
          id: 'connection1'
        },
        {
          id: 'connection2'
        }
      ]
    }
    const operation = `
      query {
        surveyAnswer (id: "surveyAnswer1") {
          connections {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        surveyAnswer: {
          connections: []
        }
      }
    })
  })
})
