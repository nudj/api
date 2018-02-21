/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

const operation = `
  mutation (
    $survey: ID!
    $data: SurveySectionCreateInput!
  ) {
    createSurveySection(
      survey: $survey
      data: $data
    ) {
      id
    }
  }
`
const variables = {
  survey: 'survey1',
  data: {
    title: 'Some Title',
    description: 'Some decription'
  }
}

describe('Mutation.createSurveySection', () => {
  let db

  beforeEach(() => {
    db = {
      surveys: [
        {
          id: 'survey1',
          surveySections: []
        }
      ],
      surveySections: []
    }
  })

  it('should create the survey', async () => {
    await executeQueryOnDbUsingSchema({
      operation,
      variables,
      db,
      schema
    })
    expect(db.surveySections[0]).to.deep.equal({
      id: 'surveySection1',
      survey: 'survey1',
      title: 'Some Title',
      description: 'Some decription',
      surveyQuestions: []
    })
  })

  it('should add new id to survey', async () => {
    await executeQueryOnDbUsingSchema({
      operation,
      variables,
      db,
      schema
    })
    expect(db.surveys[0].surveySections).to.deep.equal(['surveySection1'])
  })

  it('return the new survey', async () => {
    const result = await executeQueryOnDbUsingSchema({
      operation,
      variables,
      db,
      schema
    })
    expect(result)
      .to.have.deep.property('data.createSurveySection')
      .to.deep.equal({
        id: 'surveySection1'
      })
  })
})
