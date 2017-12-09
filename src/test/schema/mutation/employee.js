/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('Mutation.employee', () => {
  it('should fetch a single employee', async () => {
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
    const mutation = `
      mutation ($id: ID!) {
        employee(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'employee2'
    }
    return expect(executeQueryOnDbUsingSchema({ mutation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        employee: {
          id: 'employee2'
        }
      }
    })
  })

  it('should return null and error if no match', async () => {
    const db = {
      employees: []
    }
    const mutation = `
      mutation ($id: ID!) {
        employee(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'employee2'
    }

    return executeQueryOnDbUsingSchema({ mutation, variables, db, schema })
      .then(shouldRespondWithGqlError({
        message: 'NotFound',
        path: ['employee']
      }))
  })
})
