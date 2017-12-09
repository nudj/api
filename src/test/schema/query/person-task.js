/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('Query.personTask', () => {
  it('should fetch a single personTask', async () => {
    const db = {
      personTasks: [
        {
          id: 'personTask1'
        },
        {
          id: 'personTask2'
        }
      ]
    }
    const query = `
      query ($id: ID!) {
        personTask(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'personTask2'
    }
    return expect(executeQueryOnDbUsingSchema({ query, variables, db, schema })).to.eventually.deep.equal({
      data: {
        personTask: {
          id: 'personTask2'
        }
      }
    })
  })

  it('should return null and error if no match', async () => {
    const db = {
      personTasks: []
    }
    const query = `
      query ($id: ID!) {
        personTask(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'personTask2'
    }

    return executeQueryOnDbUsingSchema({ query, variables, db, schema })
      .then(shouldRespondWithGqlError({
        message: 'NotFound',
        path: ['personTask']
      }))
  })
})
