/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('SurveyAnswer.person', () => {
  it('should fetch filtered person', async () => {
    const db = {
      surveyAnswers: [
        {
          id: 'surveyAnswer1',
          person: 'person2'
        }
      ],
      people: [
        {
          id: 'person1'
        },
        {
          id: 'person2'
        }
      ]
    }
    const operation = `
      query {
        surveyAnswer (id: "surveyAnswer1") {
          person {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        surveyAnswer: {
          person: {
            id: 'person2'
          }
        }
      }
    })
  })

  it('should return null and error if no matches', async () => {
    const db = {
      surveyAnswers: [
        {
          id: 'surveyAnswer1',
          person: 'person3'
        }
      ],
      people: [
        {
          id: 'person1'
        },
        {
          id: 'person2'
        }
      ]
    }
    const operation = `
      query {
        surveyAnswer (id: "surveyAnswer1") {
          person {
            id
          }
        }
      }
    `
    return executeQueryOnDbUsingSchema({ operation, db, schema })
      .then(shouldRespondWithGqlError({
        message: 'NotFound',
        path: [
          'surveyAnswer',
          'person'
        ]
      }))
  })
})
