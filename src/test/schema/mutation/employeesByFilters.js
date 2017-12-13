/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Mutation.employeesByFilters', () => {
  it('should fetch filtered employees', async () => {
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
      mutation {
        employeesByFilters {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        employeesByFilters: [
          {
            id: 'employee1'
          },
          {
            id: 'employee2'
          }
        ]
      }
    })
  })

  it('should return empty array if no matches', async () => {
    const db = {
      employees: []
    }
    const operation = `
      mutation {
        employeesByFilters {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        employeesByFilters: []
      }
    })
  })
})