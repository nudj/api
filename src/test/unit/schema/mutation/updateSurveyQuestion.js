/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const { values: SurveyQuestionTypes } = require('../../../../gql/schema/enums/survey-question-types')
const { values: tagTypes } = require('../../../../gql/schema/enums/tag-types')
const { values: tagSources } = require('../../../../gql/schema/enums/tag-sources')

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
const variables = {
  id: 'surveyQuestion1',
  data: {
    title: 'New title',
    description: 'New description',
    name: 'New name',
    required: false,
    type: SurveyQuestionTypes.COMPANIES,
    tags: ['CEO']
  }
}

describe('Mutation.updateSurveyQuestion', () => {
  let db

  describe('when new tags are added', () => {
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
        ],
        tags: [
          {
            id: 'tag1',
            name: 'CEO',
            type: tagTypes.EXPERTISE
          }
        ],
        entityTags: [
          {
            id: 'entityTag1',
            entityId: 'surveyQuestion1',
            entityType: 'surveyQuestion',
            source: tagSources.NUDJ,
            tagId: 'tag1'
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

    it('should create new tags', async () => {
      await executeQueryOnDbUsingSchema({
        operation,
        schema,
        db,
        variables: {
          id: 'surveyQuestion1',
          data: {
            tags: ['FOUNDER', 'CEO']
          }
        }
      })
      expect(db.entityTags).to.deep.equal([
        {
          entityId: 'surveyQuestion1',
          entityType: 'surveyQuestion',
          id: 'entityTag1',
          source: tagSources.NUDJ,
          tagId: 'tag2'
        },
        {
          entityId: 'surveyQuestion1',
          entityType: 'surveyQuestion',
          id: 'entityTag2',
          source: tagSources.NUDJ,
          tagId: 'tag1'
        }
      ])
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

    it('should not create pre-existing tags', async () => {
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
          source: tagSources.NUDJ,
          tagId: 'tag1'
        }
      ])
      expect(db.tags).to.deep.equal([
        {
          id: 'tag1',
          name: 'CEO',
          type: tagTypes.EXPERTISE
        }
      ])
    })

    it('should return the updated survey', async () => {
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

    it('should error if given invalid tags', async () => {
      const result = await executeQueryOnDbUsingSchema({
        operation,
        variables: {
          id: 'surveyQuestion1',
          data: {
            tags: ['bad']
          }
        },
        db,
        schema
      })
      expect(result.errors[0]).to.have.property('message').to.include(
        'Expected type "ExpertiseTagType", found "bad"'
      )
    })
  })

  describe('when old tags are removed', () => {
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
        ],
        tags: [
          {
            id: 'tag1',
            name: 'FOUNDER',
            type: tagTypes.EXPERTISE
          },
          {
            id: 'tag2',
            name: 'FINANCE',
            type: tagTypes.EXPERTISE
          }
        ],
        entityTags: [
          {
            id: 'entityTag1',
            entityId: 'surveyQuestion1',
            entityType: 'surveyQuestion',
            source: tagSources.NUDJ,
            tagId: 'tag1'
          },
          {
            id: 'entityTag2',
            entityId: 'surveyQuestion1',
            entityType: 'surveyQuestion',
            source: tagSources.NUDJ,
            tagId: 'tag2'
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

    it('should delete unused entityTags', async () => {
      await executeQueryOnDbUsingSchema({
        operation,
        variables,
        db,
        schema
      })
      expect(db.entityTags).to.deep.equal([
        {
          id: 'entityTag1',
          entityId: 'surveyQuestion1',
          entityType: 'surveyQuestion',
          source: tagSources.NUDJ,
          tagId: 'tag3'
        }
      ])
    })
  })
})
