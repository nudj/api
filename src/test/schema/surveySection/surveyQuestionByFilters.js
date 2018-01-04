/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('SurveySection.surveyQuestionByFilters', () => {
  const operation = `
    query {
      surveySection (id: "surveySection1") {
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
      surveySections: [
        {
          id: 'surveySection1'
        }
      ],
      surveyQuestions: [
        {
          id: 'surveyQuestion1',
          surveySection: 'surveySection2'
        },
        {
          id: 'surveyQuestion2',
          surveySection: 'surveySection1'
        }
      ]
    }
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        surveySection: {
          surveyQuestionByFilters: {
            id: 'surveyQuestion2'
          }
        }
      }
    })
  })

  it('should return null and error if surveyQuestion exists but is not child of selected surveySection', async () => {
    const db = {
      surveySections: [
        {
          id: 'surveySection1'
        }
      ],
      surveyQuestions: [
        {
          id: 'surveyQuestion1',
          surveySection: 'surveySection1'
        },
        {
          id: 'surveyQuestion2',
          surveySection: 'surveySection2'
        }
      ]
    }
    return executeQueryOnDbUsingSchema({ operation, db, schema })
      .then(shouldRespondWithGqlError({
        message: 'NotFound',
        path: [
          'surveySection',
          'surveyQuestionByFilters'
        ]
      }))
  })

  it('should return null and error if no matches', async () => {
    const db = {
      surveySections: [
        {
          id: 'surveySection1'
        }
      ],
      surveyQuestions: [
        {
          id: 'surveyQuestion1',
          surveySection: 'surveySection2'
        }
      ]
    }
    return executeQueryOnDbUsingSchema({ operation, db, schema })
      .then(shouldRespondWithGqlError({
        message: 'NotFound',
        path: [
          'surveySection',
          'surveyQuestionByFilters'
        ]
      }))
  })
})
