/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

const operation = `
  mutation (
    $id: ID!
    $data: SurveySectionUpdateInput!
  ) {
    updateSurveySection (
      id: $id
      data: $data
    ) {
      id
      title
      slug
      description
    }
  }
`
let variables = {
  id: 'surveySection1',
  data: {
    title: 'New Title',
    description: 'New description'
  }
}

describe('Mutation.updateSurveySection', () => {
  let db

  beforeEach(() => {
    db = {
      surveySections: [
        {
          id: 'surveySection1',
          title: 'Old Title',
          slug: 'old-title',
          description: 'Old description',
          surveyQuestions: JSON.stringify(['1', '2', '3'])
        }
      ]
    }
  })

  it('should update the surveySection', async () => {
    await executeQueryOnDbUsingSchema({
      operation,
      variables,
      db,
      schema
    })
    expect(db.surveySections[0]).to.deep.equal({
      id: 'surveySection1',
      title: 'New Title',
      slug: 'new-title',
      description: 'New description',
      surveyQuestions: JSON.stringify(['1', '2', '3'])
    })
  })

  it('return the updated surveySection', async () => {
    const result = await executeQueryOnDbUsingSchema({
      operation,
      variables,
      db,
      schema
    })
    expect(result)
      .to.have.deep.property('data.updateSurveySection')
      .to.deep.equal({
        id: 'surveySection1',
        title: 'New Title',
        slug: 'new-title',
        description: 'New description'
      })
  })

  describe('when given a new question order', () => {
    it('should update the question order in the db', async () => {
      variables = {
        id: 'surveySection1',
        data: {
          surveyQuestions: ['3', '2', '1']
        }
      }
      await executeQueryOnDbUsingSchema({
        operation,
        variables,
        db,
        schema
      })
      expect(db)
        .to.have.deep.property('surveySections.0.surveyQuestions')
        .to.deep.equal(JSON.stringify(['3', '2', '1']))
    })
  })

  describe('when no changes', () => {
    it('should not change the record in the db', async () => {
      variables = {
        id: 'surveySection1',
        data: {}
      }
      await executeQueryOnDbUsingSchema({
        operation,
        variables,
        db,
        schema
      })
      expect(db.surveySections[0]).to.deep.equal({
        id: 'surveySection1',
        title: 'Old Title',
        slug: 'old-title',
        description: 'Old description',
        surveyQuestions: JSON.stringify(['1', '2', '3'])
      })
    })

    it('should return the unchanged record', async () => {
      variables = {
        id: 'surveySection1',
        data: {}
      }
      const result = await executeQueryOnDbUsingSchema({
        operation,
        variables,
        db,
        schema
      })
      expect(result.data.updateSurveySection).to.deep.equal({
        id: 'surveySection1',
        title: 'Old Title',
        slug: 'old-title',
        description: 'Old description'
      })
    })
  })
})
