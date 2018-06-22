/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

const operation = `
  mutation (
    $company: ID
    $data: SurveyCreateInput!
  ) {
    createSurvey(
      company: $company
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

describe('Mutation.createSurvey', () => {
  let db

  beforeEach(() => {
    db = {
      companies: [
        {
          id: 'company1'
        }
      ],
      surveys: [],
      companySurveys: []
    }
  })

  describe('when company id provided', () => {
    let result
    let variables = {
      company: 'company1',
      data: {
        introTitle: 'Some Intro Title',
        introDescription: 'Some intro decription',
        outroTitle: 'Some Outro Title',
        outroDescription: 'Some outro description'
      }
    }

    beforeEach(async () => {
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

    it('should create the survey', async () => {
      expect(db.surveys[0]).to.deep.equal({
        id: 'survey1',
        slug: 'some-intro-title',
        introTitle: 'Some Intro Title',
        introDescription: 'Some intro decription',
        outroTitle: 'Some Outro Title',
        outroDescription: 'Some outro description',
        surveySections: JSON.stringify([])
      })
    })

    it('should create a companySurvey', async () => {
      expect(db.companySurveys[0]).to.deep.equal({
        id: 'companySurvey1',
        company: 'company1',
        survey: db.surveys[0].id
      })
    })

    it('return the new survey', async () => {
      expect(result)
        .to.have.deep.property('data.createSurvey')
        .to.deep.equal({
          id: 'survey1',
          slug: 'some-intro-title',
          introTitle: 'Some Intro Title',
          introDescription: 'Some intro decription',
          outroTitle: 'Some Outro Title',
          outroDescription: 'Some outro description'
        })
    })
  })

  describe('when company id not provided', () => {
    let result
    let variables = {
      data: {
        introTitle: 'Some Intro Title',
        introDescription: 'Some intro decription',
        outroTitle: 'Some Outro Title',
        outroDescription: 'Some outro description'
      }
    }

    beforeEach(async () => {
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

    it('should create the survey', async () => {
      expect(db.surveys[0]).to.deep.equal({
        id: 'survey1',
        slug: 'some-intro-title',
        introTitle: 'Some Intro Title',
        introDescription: 'Some intro decription',
        outroTitle: 'Some Outro Title',
        outroDescription: 'Some outro description',
        surveySections: JSON.stringify([])
      })
    })

    it('should not create a companySurvey', async () => {
      expect(db.companySurveys).to.be.empty()
    })

    it('return the new survey', async () => {
      expect(result)
        .to.have.deep.property('data.createSurvey')
        .to.deep.equal({
          id: 'survey1',
          slug: 'some-intro-title',
          introTitle: 'Some Intro Title',
          introDescription: 'Some intro decription',
          outroTitle: 'Some Outro Title',
          outroDescription: 'Some outro description'
        })
    })
  })
})
