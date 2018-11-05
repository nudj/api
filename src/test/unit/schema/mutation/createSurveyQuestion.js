/* eslint-env mocha */
const chai = require('chai')

const { merge } = require('@nudj/library')

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const { values: tagTypes } = require('../../../../gql/schema/enums/tag-types')
const { values: tagSources } = require('../../../../gql/schema/enums/tag-sources')
const { values: SurveyQuestionTypes } = require('../../../../gql/schema/enums/survey-question-types')

const expect = chai.expect
const operation = `
  mutation (
    $survey: ID!
    $data: SurveyQuestionCreateInput!
  ) {
    createSurveyQuestion(
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
    title: 'Some title',
    description: 'Some description',
    name: 'someName',
    required: true,
    type: SurveyQuestionTypes.COMPANIES,
    tags: ['CEO', 'FOUNDER']
  }
}

describe('Mutation.createSurveyQuestion', () => {
  let db

  beforeEach(() => {
    db = {
      surveys: [
        {
          id: 'survey1',
          surveyQuestions: []
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
      description: 'Some description',
      name: 'someName',
      required: true,
      type: SurveyQuestionTypes.COMPANIES,
      survey: 'survey1'
    })
  })

  it('should create the appropriate surveyQuestionTags', async () => {
    await executeQueryOnDbUsingSchema({
      operation,
      variables,
      db,
      schema
    })
    expect(db.surveyQuestionTags).to.deep.equal([
      {
        id: 'surveyQuestionTag1',
        source: tagSources.NUDJ,
        surveyQuestion: 'surveyQuestion1',
        tag: 'tag1'
      },
      {
        id: 'surveyQuestionTag2',
        source: tagSources.NUDJ,
        surveyQuestion: 'surveyQuestion1',
        tag: 'tag2'
      }
    ])
  })

  it('should create the appropriate tags', async () => {
    await executeQueryOnDbUsingSchema({
      operation,
      variables,
      db,
      schema
    })
    expect(db.tags).to.deep.equal([
      {
        id: 'tag1',
        name: 'CEO',
        type: tagTypes.EXPERTISE
      },
      {
        id: 'tag2',
        name: 'FOUNDER',
        type: tagTypes.EXPERTISE
      }
    ])
  })

  it('should add new id to survey', async () => {
    await executeQueryOnDbUsingSchema({
      operation,
      variables,
      db,
      schema
    })
    expect(db.surveys[0].surveyQuestions).to.deep.equal(['surveyQuestion1'])
  })

  it('should return the new surveyQuestion', async () => {
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

  it('should error if given invalid tags', async () => {
    const badVariables = merge(variables, {
      data: {
        tags: ['bad']
      }
    })

    const result = await executeQueryOnDbUsingSchema({
      operation,
      variables: badVariables,
      db,
      schema
    })
    expect(result.errors[0]).to.have.property('message').to.include(
      'Expected type "ExpertiseTagType", found "bad"'
    )
  })
})
