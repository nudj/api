/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

const operation = `
  mutation ($data: SurveyCreateInput!) {
    company(id: "company1") {
      createSurvey(data: $data) {
        id
        slug
      }
    }
  }
`
const variables = {
  company: 'company1',
  data: {
    introTitle: 'Some Intro Title',
    introDescription: 'Some intro decription'
  }
}

describe('Company.createSurvey', () => {
  let db
  let result
  beforeEach(async () => {
    db = {
      companies: [
        {
          id: 'company1'
        }
      ],
      surveys: [],
      companySurveys: []
    }
    result = await executeQueryOnDbUsingSchema({
      operation,
      variables,
      db,
      schema
    })
  })

  afterEach(() => {
    result = undefined
  })

  it('should create the survey', () => {
    expect(db.surveys[0]).to.deep.equal({
      id: 'survey1',
      slug: 'some-intro-title',
      introTitle: 'Some Intro Title',
      introDescription: 'Some intro decription',
      surveyQuestions: []
    })
  })

  it('should create the survey with a generated slug', () => {
    expect(db.surveys[0]).to.have.property('slug', 'some-intro-title')
  })

  it('should create a companySurvey', () => {
    expect(db.companySurveys[0]).to.deep.equal({
      id: 'companySurvey1',
      company: 'company1',
      survey: db.surveys[0].id
    })
  })

  it('return the new survey', () => {
    expect(result).to.have.deep.property('data.company.createSurvey').to.deep.equal({
      id: 'survey1',
      slug: 'some-intro-title'
    })
  })
})
