/* eslint-env mocha */
const chai = require('chai')
const clone = require('lodash/cloneDeep')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema, shouldRespondWithGqlError } = require('../../helpers')

const operation = `
  mutation updateSurvey($data: SurveyUpdateInput!, $filters: SurveyFilterInput!) {
    company(id: "company1") {
      updateSurveyByFilters(filters: $filters, data: $data) {
        id
        introTitle
      }
    }
  }
`
const variables = {
  filters: {
    slug: 'the-best-survey-youre-gonna-love-it'
  },
  data: {
    introTitle: 'Bing bing!'
  }
}
const baseDb = {
  companies: [{
    id: 'company1',
    name: 'Company One'
  }],
  surveys: [{
    id: 'survey1',
    slug: 'the-best-survey-youre-gonna-love-it',
    introTitle: 'Bing bing, you know what that is, right?'
  }],
  companySurveys: [{
    id: 'companySurvey1',
    company: 'company1',
    survey: 'survey1'
  }]
}

describe.only('Company.updateSurveyByFilters', () => {
  let db
  let result

  beforeEach(async () => {
    db = clone(baseDb)
    result = await executeQueryOnDbUsingSchema({ operation, db, schema, variables })
  })

  afterEach(() => {
    result = undefined
  })

  it.only('updates the survey', async () => {
    expect(db.surveys[0]).to.deep.equal({
      id: 'survey1',
      slug: 'the-best-survey-youre-gonna-love-it',
      introTitle: 'Bing bing!'
    })
  })

  it('returns the updated survey', async () => {
    expect(result).to.have.deep.property('data.company.updateSurveyByFilters').to.deep.equal({
      id: db.surveys[0].id,
      introTitle: db.surveys[0].introTitle
    })
  })

  describe('when the `introTitle` field is updated', () => {
    beforeEach(async () => {
      db = clone(baseDb)
      result = await executeQueryOnDbUsingSchema({ operation, db, schema, variables })
    })

    afterEach(() => {
      result = undefined
    })

    it('updates the slug', async () => {
      expect(db.surveys[0]).to.have.property('slug', 'bing-bing')
    })
  })

  describe('when the survey does not exist', () => {
    it('throws an error', async () => {
      db.surveys = []
      const result = await executeQueryOnDbUsingSchema({ operation, db, schema, variables })
      shouldRespondWithGqlError({
        message: 'Survey by filters `{"slug":"the-best-survey-youre-gonna-love-it"}` not found',
        path: [ 'company', 'updateSurveyByFilters' ]
      })(result)
    })
  })

  describe('when the survey does not belong to the company', () => {
    it('throws an error', async () => {
      db.companySurveys = [{
        id: 'companySurvey1',
        company: 'differentCompany111',
        survey: 'survey1'
      }]
      const result = await executeQueryOnDbUsingSchema({ operation, db, schema, variables })
      shouldRespondWithGqlError({
        message: 'Survey not found',
        path: [ 'company', 'updateSurveyByFilters' ]
      })(result)
    })
  })
})
