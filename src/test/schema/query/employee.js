/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Query.employees', () => {
  it('should fetch all employees', async () => {
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
      query {
        employees {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ query, db, schema })).to.eventually.deep.equal({
      data: {
        employees: [
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
    const query = `
      query {
        employees {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ query, db, schema })).to.eventually.deep.equal({
      data: {
        employees: []
      }
    })
  })
})
