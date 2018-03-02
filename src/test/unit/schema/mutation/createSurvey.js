/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

const operation = `
  mutation (
    $company: ID!
    $data: SurveyCreateInput!
  ) {
    createSurvey(
      company: $company
      data: $data
    ) {
      id
    }
  }
`
const variables = {
  company: 'company1',
  data: {
    slug: 'aided-recall-baby',
    introTitle: 'Some Intro Title',
    introDescription: 'Some intro decription',
    outroTitle: 'Some Outro Title',
    outroDescription: 'Some outro description'
  }
}

describe('Mutation.createSurvey', () => {
  let db

  beforeEach(() => {
    db = {
      surveys: []
    }
  })

  it('should create the survey', async () => {
    await executeQueryOnDbUsingSchema({
      operation,
      variables,
      db,
      schema
    })
    expect(db.surveys[0]).to.deep.equal({
      id: 'survey1',
      slug: 'aided-recall-baby',
      company: 'company1',
      introTitle: 'Some Intro Title',
      introDescription: 'Some intro decription',
      outroTitle: 'Some Outro Title',
      outroDescription: 'Some outro description',
      surveySections: []
    })
  })

  it('return the new survey', async () => {
    const result = await executeQueryOnDbUsingSchema({
      operation,
      variables,
      db,
      schema
    })
    expect(result)
      .to.have.deep.property('data.createSurvey')
      .to.deep.equal({
        id: 'survey1'
      })
  })
})
