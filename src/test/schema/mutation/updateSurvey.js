/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

const operation = `
  mutation (
    $id: ID!
    $data: SurveyUpdateInput!
  ) {
    updateSurvey(
      id: $id
      data: $data
    ) {
      id
      slug
      introTitle
      introDescription
      outroTitle
      outroDescription
    }
  }
`
let variables = {
  id: 'survey1',
  data: {
    slug: 'new-slug',
    introTitle: 'New Intro Title',
    introDescription: 'New intro decription',
    outroTitle: 'New Outro Title',
    outroDescription: 'New outro description'
  }
}

describe('Mutation.updateSurvey', () => {
  let db

  beforeEach(() => {
    db = {
      surveys: [
        {
          id: 'survey1',
          company: 'company1',
          slug: 'old-slug',
          introTitle: 'Old Intro Title',
          introDescription: 'Old intro decription',
          outroTitle: 'Old Outro Title',
          outroDescription: 'Old outro description',
          surveySections: ['1', '2', '3']
        }
      ]
    }
  })

  it('should update the survey', async () => {
    await executeQueryOnDbUsingSchema({
      operation,
      variables,
      db,
      schema
    })
    expect(db.surveys[0]).to.deep.equal({
      id: 'survey1',
      company: 'company1',
      slug: 'new-slug',
      introTitle: 'New Intro Title',
      introDescription: 'New intro decription',
      outroTitle: 'New Outro Title',
      outroDescription: 'New outro description',
      surveySections: ['1', '2', '3']
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
      .to.have.deep.property('data.updateSurvey')
      .to.deep.equal({
        id: 'survey1',
        slug: 'new-slug',
        introTitle: 'New Intro Title',
        introDescription: 'New intro decription',
        outroTitle: 'New Outro Title',
        outroDescription: 'New outro description'
      })
  })

  describe('when given a new section order', () => {
    it('should update the section order in the db', async () => {
      variables = {
        id: 'survey1',
        data: {
          surveySections: ['3', '2', '1']
        }
      }
      await executeQueryOnDbUsingSchema({
        operation,
        variables,
        db,
        schema
      })
      expect(db)
        .to.have.deep.property('surveys.0.surveySections')
        .to.deep.equal(['3', '2', '1'])
    })
  })
})
