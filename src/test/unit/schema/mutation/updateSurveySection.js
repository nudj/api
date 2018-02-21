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
      description
    }
  }
`
let variables = {
  id: 'surveySection1',
  data: {
    title: 'New Title',
    description: 'New decription'
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
          description: 'Old decription',
          surveyQuestions: ['1', '2', '3']
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
      description: 'New decription',
      surveyQuestions: ['1', '2', '3']
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
      .to.have.deep.property('data.updateSurveySection')
      .to.deep.equal({
        id: 'surveySection1',
        title: 'New Title',
        description: 'New decription'
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
        .to.deep.equal(['3', '2', '1'])
    })
  })
})
