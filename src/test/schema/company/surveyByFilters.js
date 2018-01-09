/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('Company.surveyByFilters', () => {
  it('should fetch filtered surveys', async () => {
    const db = {
      companies: [
        {
          id: 'company1'
        }
      ],
      surveys: [
        {
          id: 'survey1',
          slug: 'surveySlug1',
          company: 'company1'
        },
        {
          id: 'survey2',
          slug: 'surveySlug2',
          company: 'company1'
        },
        {
          id: 'survey3',
          slug: 'surveySlug2',
          company: 'company2'
        }
      ]
    }
    const operation = `
      query {
        company (id: "company1") {
          surveyByFilters(filters: {
            slug: "surveySlug2"
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
            id: 'survey2',
            slug: 'surveySlug2'
          }
        }
      }
    })
  })

  it('should return empty array if no matches', async () => {
    const db = {
      companies: [
        {
          id: 'company1'
        }
      ],
      surveys: [
        {
          id: 'survey1',
          slug: 'surveySlug1',
          company: 'company1'
        },
        {
          id: 'survey2',
          slug: 'surveySlug2',
          company: 'company1'
        },
        {
          id: 'survey3',
          slug: 'surveySlug3',
          company: 'company2'
        }
      ]
    }
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
    return executeQueryOnDbUsingSchema({ operation, db, schema })
      .then(shouldRespondWithGqlError({
        message: 'NotFound',
        path: [
          'company',
          'surveyByFilters'
        ]
      }))
  })
})
