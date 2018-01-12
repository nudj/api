/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

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
    const operation = `
      query ($id: ID!) {
        employee(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'employee2'
    }
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        employee: {
          id: 'employee2'
        }
      }
    })
  })

  it('should return null if no match', async () => {
    const db = {
      employees: []
    }
    const operation = `
      query ($id: ID!) {
        employee(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'employee2'
    }

    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        employee: null
      }
    })
  })
})
