/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Company.surveyByFilters', () => {
  const db = {
    companies: [
      {
        id: 'company1'
      }
    ],
    surveys: [
      {
        id: 'survey1',
        slug: 'surveySlug1'
      }
    ],
    companySurveys: [
      {
        id: 'companySurvey1',
        company: 'company1',
        survey: 'survey1'
      }
    ]
  }

  it('should fetch filtered surveys', async () => {
    const operation = `
      query {
        company (id: "company1") {
          surveyByFilters(filters: {
            slug: "surveySlug1"
          }) {
            id
            slug
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        company: {
          surveyByFilters: {
            id: 'survey1',
            slug: 'surveySlug1'
          }
        }
      }
    })
  })

  it('should return null if no matches', async () => {
    const operation = `
      query {
        company (id: "company1") {
          surveyByFilters(filters: {
            slug: "surveySlug3"
          }) {
            id
            slug
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        company: {
          surveyByFilters: null
        }
      }
    })
  })
})
