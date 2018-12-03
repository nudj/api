/* eslint-env mocha */
const chai = require('chai')
const clone = require('lodash/cloneDeep')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema, shouldRespondWithGqlError } = require('../../helpers')

const operation = `
  mutation updateQuestion ($data: SurveyQuestionUpdateInput!, $filters: SurveyQuestionFilterInput!) {
    survey(id: "survey1") {
      updateSurveyQuestionByFilters(filters: $filters, data: $data) {
        id
        title
      }
    }
  }
`
const variables = {
  filters: {
    slug: 'bing-bing'
  },
  data: {
    title: 'Bing bing!'
  }
}
const baseDb = {
  companies: [{
    id: 'company1',
    name: 'Company One'
  }],
  surveyQuestions: [{
    id: 'surveyQuestion1',
    slug: 'bing-bing',
    survey: 'survey1',
    title: 'Bing bing, you know what that is, right?'
  }],
  surveys: [{
    id: 'survey1'
  }]
}

describe('Survey.updateSurveyQuestionByFilters', () => {
  let db
  let result

  beforeEach(async () => {
    db = clone(baseDb)
    result = await executeQueryOnDbUsingSchema({ operation, db, schema, variables })
  })

  afterEach(() => {
    result = undefined
  })

  it('updates the survey question', async () => {
    expect(db.surveyQuestions[0]).to.deep.equal({
      id: 'surveyQuestion1',
      slug: 'bing-bing',
      survey: 'survey1',
      title: 'Bing bing!'
    })
  })

  it('returns the updated survey', async () => {
    expect(result).to.have.deep.property('data.survey.updateSurveyQuestionByFilters').to.deep.equal({
      id: db.surveyQuestions[0].id,
      title: db.surveyQuestions[0].title
    })
  })

  describe('when the question does not exist', () => {
    it('throws an error', async () => {
      db.surveyQuestions = []
      const result = await executeQueryOnDbUsingSchema({ operation, db, schema, variables })
      shouldRespondWithGqlError({
        message: 'SurveyQuestion by filters `{"slug":"bing-bing"}` not found',
        path: [ 'survey', 'updateSurveyQuestionByFilters' ]
      })(result)
    })
  })

  describe('when the question does not belong to the survey', () => {
    it('throws an error', async () => {
      db.surveyQuestions = [{
        id: 'surveyQuestion1',
        slug: 'bing-bing',
        survey: 'survey2',
        title: 'Bing bing, you know what that is, right?'
      }]
      const result = await executeQueryOnDbUsingSchema({ operation, db, schema, variables })
      shouldRespondWithGqlError({
        message: 'SurveyQuestion by filters `{"slug":"bing-bing"}` not found',
        path: [ 'survey', 'updateSurveyQuestionByFilters' ]
      })(result)
    })
  })
})
