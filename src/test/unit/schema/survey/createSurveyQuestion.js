/* eslint-env mocha */
const chai = require('chai')

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const { values: SurveyQuestionTypes } = require('../../../../gql/schema/enums/survey-question-types')

const expect = chai.expect
const operation = `
  mutation ($data: SurveyQuestionCreateInput!) {
    survey(id: "survey1") {
      createSurveyQuestion(data: $data) {
        id
      }
    }
  }
`
const variables = {
  data: {
    title: 'Some title',
    description: 'Some description',
    required: true,
    type: SurveyQuestionTypes.COMPANIES
  }
}

describe('Survey.createSurveyQuestion', () => {
  let db

  beforeEach(() => {
    db = {
      surveys: [
        {
          id: 'survey1',
          surveyQuestions: '[]'
        }
      ],
      surveyQuestions: [],
      surveyQuestionTags: [],
      tags: []
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
      slug: 'some-title',
      description: 'Some description',
      required: true,
      type: SurveyQuestionTypes.COMPANIES,
      survey: 'survey1'
    })
  })

  it('should update the survey with the new surveyQuestion id', async () => {
    await executeQueryOnDbUsingSchema({
      operation,
      variables,
      db,
      schema
    })
    expect(db.surveys[0].surveyQuestions).to.deep.equal(JSON.stringify(['surveyQuestion1']))
  })

  it('should generate a surveyQuestion slug', async () => {
    await executeQueryOnDbUsingSchema({
      operation,
      variables,
      db,
      schema
    })
    expect(db.surveyQuestions[0].slug).to.equal('some-title')
  })

  it('should return the new surveyQuestion', async () => {
    const result = await executeQueryOnDbUsingSchema({
      operation,
      variables,
      db,
      schema
    })
    expect(result)
      .to.have.deep.property('data.survey.createSurveyQuestion')
      .to.deep.equal({
        id: 'surveyQuestion1'
      })
  })
})
