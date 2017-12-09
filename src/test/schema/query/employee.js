/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('Query.employee', () => {
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
    const query = `
      query ($id: ID!) {
        employee(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'employee2'
    }
    return expect(executeQueryOnDbUsingSchema({ query, variables, db, schema })).to.eventually.deep.equal({
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
    const query = `
      query ($id: ID!) {
        employee(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'employee2'
    }

    return executeQueryOnDbUsingSchema({ query, variables, db, schema })
      .then(shouldRespondWithGqlError({
        message: 'NotFound',
        path: ['employee']
      }))
  })
})
