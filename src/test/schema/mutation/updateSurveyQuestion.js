/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const { values: SurveyQuestionTypes } = require('../../../gql/schema/enums/survey-question-types')

const operation = `
  mutation (
    $id: ID!
    $data: SurveyQuestionUpdateInput!
  ) {
    updateSurveyQuestion (
      id: $id
      data: $data
    ) {
      id
      title
      description
      name
      required
      type
    }
  }
`
let variables = {
  id: 'surveyQuestion1',
  data: {
    title: 'New title',
    description: 'New description',
    name: 'New name',
    required: false,
    type: SurveyQuestionTypes.COMPANIES
  }
}

describe('Mutation.updateSurveyQuestion', () => {
  let db

  beforeEach(() => {
    db = {
      surveyQuestions: [
        {
          id: 'surveyQuestion1',
          title: 'Old title',
          description: 'Old description',
          name: 'Old name',
          required: true,
          type: SurveyQuestionTypes.CONNECTIONS
        }
      ]
    }
  })

  it('should update the surveyQuestion', async () => {
    await executeQueryOnDbUsingSchema({
      operation,
      variables,
      db,
      schema
    })
    expect(db.surveyQuestions[0]).to.deep.equal({
      id: 'surveyQuestion1',
      title: 'New title',
      description: 'New description',
      name: 'New name',
      required: false,
      type: SurveyQuestionTypes.COMPANIES
    })
  })

  it('return the updated survey', async () => {
    const result = await executeQueryOnDbUsingSchema({
      operation,
      variables,
      db,
      schema
    })
    expect(result)
      .to.have.deep.property('data.updateSurveyQuestion')
      .to.deep.equal({
        id: 'surveyQuestion1',
        title: 'New title',
        description: 'New description',
        name: 'New name',
        required: false,
        type: SurveyQuestionTypes.COMPANIES
      })
  })
})
