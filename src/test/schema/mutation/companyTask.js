/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('Mutation.companyTask', () => {
  it('should fetch a single companyTask', async () => {
    const db = {
      companyTasks: [
        {
          id: 'companyTask1'
        },
        {
          id: 'companyTask2'
        }
      ]
    }
    const operation = `
      mutation ($id: ID!) {
        companyTask(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'companyTask2'
    }
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        companyTask: {
          id: 'companyTask2'
        }
      }
    })
  })

  it('should return null and error if no match', async () => {
    const db = {
      companyTasks: []
    }
    const operation = `
      mutation ($id: ID!) {
        companyTask(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'companyTask2'
    }

    return executeQueryOnDbUsingSchema({ operation, variables, db, schema })
      .then(shouldRespondWithGqlError({
        message: 'NotFound',
        path: ['companyTask']
      }))
  })
})
