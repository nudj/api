/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const { values: SurveyQuestionTypes } = require('../../../../gql/schema/enums/survey-question-types')

const operation = `
  mutation (
    $surveySection: ID!
    $data: SurveyQuestionCreateInput!
  ) {
    createSurveyQuestion(
      surveySection: $surveySection
      data: $data
    ) {
      id
    }
  }
`
const variables = {
  surveySection: 'surveySection1',
  data: {
    title: 'Some title',
    description: 'Some description',
    name: 'someName',
    required: true,
    type: SurveyQuestionTypes.COMPANIES
  }
}

describe('Mutation.createSurveyQuestion', () => {
  let db

  beforeEach(() => {
    db = {
      surveySections: [
        {
          id: 'surveySection1',
          surveyQuestions: []
        }
      ],
      surveyQuestions: []
    }
  })

  it('should create the surveyQuestion', async () => {
    await executeQueryOnDbUsingSchema({
      operation,
      variables,
      db,
      schema
    })
    expect(db.surveyQuestions[0]).to.deep.equal({
      id: 'surveyQuestion1',
      title: 'Some title',
      description: 'Some description',
      name: 'someName',
      required: true,
      type: SurveyQuestionTypes.COMPANIES,
      surveySection: 'surveySection1'
    })
  })

  it('should add new id to surveySection', async () => {
    await executeQueryOnDbUsingSchema({
      operation,
      variables,
      db,
      schema
    })
    expect(db.surveySections[0].surveyQuestions).to.deep.equal(['surveyQuestion1'])
  })

  it('return the new surveyQuestion', async () => {
    const result = await executeQueryOnDbUsingSchema({
      operation,
      variables,
      db,
      schema
    })
    expect(result)
      .to.have.deep.property('data.createSurveyQuestion')
      .to.deep.equal({
        id: 'surveyQuestion1'
      })
  })
})
