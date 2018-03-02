/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Mutation.survey', () => {
  it('should fetch a single survey', async () => {
    const db = {
      surveys: [
        {
          id: 'survey1'
        },
        {
          id: 'survey2'
        }
      ]
    }
    const operation = `
      mutation ($id: ID!) {
        survey(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'survey2'
    }
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        survey: {
          id: 'survey2'
        }
      }
    })
  })

  it('should return null if no match', async () => {
    const db = {
      surveys: []
    }
    const operation = `
      mutation ($id: ID!) {
        survey(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'survey2'
    }

    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        survey: null
      }
    })
  })
})
