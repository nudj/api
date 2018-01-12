/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Query.surveySectionByFilters', () => {
  it('should fetch first filtered surveySection', async () => {
    const db = {
      surveySections: [
        {
          id: 'surveySection1'
        },
        {
          id: 'surveySection2'
        }
      ]
    }
    const operation = `
      query ($id: ID!) {
        surveySectionByFilters (filters: {
          id: $id
        }) {
          id
        }
      }
    `
    const variables = {
      id: 'surveySection2'
    }
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        surveySectionByFilters: {
          id: 'surveySection2'
        }
      }
    })
  })

  it('should return null if no match', async () => {
    const db = {
      surveySections: []
    }
    const operation = `
      query ($id: ID!) {
        surveySectionByFilters (filters: {
          id: $id
        }) {
          id
        }
      }
    `
    const variables = {
      id: 'surveySection2'
    }
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        surveySectionByFilters: null
      }
    })
  })
})
