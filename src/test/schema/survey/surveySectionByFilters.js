/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Survey.surveySectionByFilters', () => {
  const operation = `
    query {
      survey (id: "survey1") {
        surveySectionByFilters (filters: {
          id: "surveySection2"
        }) {
          id
        }
      }
    }
  `

  it('should fetch filtered surveySections', async () => {
    const db = {
      surveys: [
        {
          id: 'survey1'
        }
      ],
      surveySections: [
        {
          id: 'surveySection1',
          survey: 'survey2'
        },
        {
          id: 'surveySection2',
          survey: 'survey1'
        }
      ]
    }
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        survey: {
          surveySectionByFilters: {
            id: 'surveySection2'
          }
        }
      }
    })
  })

  it('should return null if surveySection exists but is not child of selected survey', async () => {
    const db = {
      surveys: [
        {
          id: 'survey1'
        }
      ],
      surveySections: [
        {
          id: 'surveySection1',
          survey: 'survey1'
        },
        {
          id: 'surveySection2',
          survey: 'survey2'
        }
      ]
    }
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        survey: {
          surveySectionByFilters: null
        }
      }
    })
  })

  it('should return null if no matches', async () => {
    const db = {
      surveys: [
        {
          id: 'survey1'
        }
      ],
      surveySections: [
        {
          id: 'surveySection1',
          survey: 'survey2'
        }
      ]
    }
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        survey: {
          surveySectionByFilters: null
        }
      }
    })
  })
})
