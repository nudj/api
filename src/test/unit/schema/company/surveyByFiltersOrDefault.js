/* eslint-env mocha */
const chai = require('chai')
const { merge } = require('@nudj/library')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const operation = `
  query ($filters: SurveyFilterInput!) {
    company (
      id: "company1"
    ) {
      surveyByFiltersOrDefault (
        filters: $filters
      ) {
        id
        slug
      }
    }
  }
`
const baseData = {
  companies: [
    {
      id: 'company1'
    },
    {
      id: 'company2'
    }
  ]
}

describe('Company.surveyByFiltersOrDefault', () => {
  describe('when filter matches one of the company\'s survey', () => {
    it('should fetch the filtered survey', async () => {
      const variables = {
        filters: {
          slug: 'real-survey'
        }
      }
      const db = merge(baseData, {
        surveys: [
          {
            id: 'survey1',
            slug: 'real-survey'
          },
          {
            id: 'survey2',
            slug: 'default'
          }
        ],
        companySurveys: [
          {
            id: 'companySurvey1',
            company: 'company1',
            survey: 'survey1'
          }
        ]
      })
      return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
        data: {
          company: {
            surveyByFiltersOrDefault: {
              id: 'survey1',
              slug: 'real-survey'
            }
          }
        }
      })
    })
  })

  describe('when filter matches but not one of the company\'s surveys', () => {
    it('should return default survey', async () => {
      const variables = {
        filters: {
          slug: 'real-survey'
        }
      }
      const db = merge(baseData, {
        surveys: [
          {
            id: 'survey1',
            slug: 'real-survey'
          },
          {
            id: 'survey2',
            slug: 'default'
          },
          {
            id: 'survey3',
            slug: 'another-survey'
          }
        ],
        companySurveys: [
          {
            id: 'companySurvey1',
            company: 'company1',
            survey: 'survey3'
          }
        ]
      })
      return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
        data: {
          company: {
            surveyByFiltersOrDefault: {
              id: 'survey2',
              slug: 'default'
            }
          }
        }
      })
    })
  })

  describe('when filter does not match any survey', () => {
    it('should return default survey', async () => {
      const variables = {
        filters: {
          slug: 'real-survey'
        }
      }
      const db = merge(baseData, {
        surveys: [
          {
            id: 'survey1',
            slug: 'different-survey'
          },
          {
            id: 'survey2',
            slug: 'default'
          }
        ],
        companySurveys: [
          {
            id: 'companySurvey1',
            company: 'company1',
            survey: 'survey1'
          }
        ]
      })
      return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
        data: {
          company: {
            surveyByFiltersOrDefault: {
              id: 'survey2',
              slug: 'default'
            }
          }
        }
      })
    })
  })

  describe('when company has no surveys assigned', () => {
    it('should return default survey', async () => {
      const variables = {
        filters: {
          slug: 'real-survey'
        }
      }
      const db = merge(baseData, {
        surveys: [
          {
            id: 'survey1',
            slug: 'real-survey'
          },
          {
            id: 'survey2',
            slug: 'default'
          }
        ],
        companySurveys: []
      })
      return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
        data: {
          company: {
            surveyByFiltersOrDefault: {
              id: 'survey2',
              slug: 'default'
            }
          }
        }
      })
    })
  })

  describe('when filtered by a slug of default', () => {
    it('should return default survey', async () => {
      const variables = {
        filters: {
          slug: 'default'
        }
      }
      const db = merge(baseData, {
        surveys: [
          {
            id: 'survey1',
            slug: 'real-survey'
          },
          {
            id: 'survey2',
            slug: 'default'
          }
        ],
        companySurveys: [
          {
            id: 'companySurvey1',
            company: 'company1',
            survey: 'survey1'
          }
        ]
      })
      return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
        data: {
          company: {
            surveyByFiltersOrDefault: {
              id: 'survey2',
              slug: 'default'
            }
          }
        }
      })
    })
  })
})
