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
    type: SurveyQuestionTypes.COMPANIES,
    tags: ['ceo', 'founder']
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
      surveyQuestions: [],
      entityTags: [],
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
      surveySection: 'surveySection1'
    })
  })

  it('should create the appropriate entity tags', async () => {
    await executeQueryOnDbUsingSchema({
      operation,
      variables,
      db,
      schema
    })
    expect(db.entityTags).to.deep.equal([
      {
        entityId: 'surveyQuestion1',
        entityType: 'surveyQuestion',
        id: 'entityTag1',
        sourceId: null,
        sourceType: tagSources.NUDJ,
        tagId: 'tag1'
      },
      {
        entityId: 'surveyQuestion1',
        entityType: 'surveyQuestion',
        id: 'entityTag2',
        sourceId: null,
        sourceType: tagSources.NUDJ,
        tagId: 'tag2'
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
        name: 'ceo',
        type: tagTypes.EXPERTISE
      },
      {
        id: 'tag2',
        name: 'founder',
        type: tagTypes.EXPERTISE
      }
    ])
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
