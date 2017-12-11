/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('Mutation.surveySection', () => {
  it('should fetch a single surveySection', async () => {
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
      mutation ($id: ID!) {
        surveySection(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'surveySection2'
    }
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        surveySection: {
          id: 'surveySection2'
        }
      }
    })
  })

  it('should return null and error if no match', async () => {
    const db = {
      surveySections: []
    }
    const operation = `
      mutation ($id: ID!) {
        surveySection(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'surveySection2'
    }

    return executeQueryOnDbUsingSchema({ operation, variables, db, schema })
      .then(shouldRespondWithGqlError({
        message: 'NotFound',
        path: ['surveySection']
      }))
  })
})
