/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('Mutation.employeeByFilters', () => {
  it('should fetch first filtered employee', async () => {
    const db = {
      employees: [
        {
          id: 'employee1'
        },
        {
          id: 'employee2'
        }
      ]
    }
    const operation = `
      mutation ($id: ID!) {
        employeeByFilters (filters: {
          id: $id
        }) {
          id
        }
      }
    `
    const variables = {
      id: 'employee2'
    }
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        employeeByFilters: {
          id: 'employee2'
        }
      }
    })
  })

  it('should return null and error if no match', async () => {
    const db = {
      employees: []
    }
    const operation = `
      mutation ($id: ID!) {
        employeeByFilters (filters: {
          id: $id
        }) {
          id
        }
      }
    `
    const variables = {
      id: 'employee2'
    }
    return executeQueryOnDbUsingSchema({ operation, variables, db, schema })
      .then(shouldRespondWithGqlError({
        message: 'NotFound',
        path: ['employeeByFilters']
      }))
  })
})
