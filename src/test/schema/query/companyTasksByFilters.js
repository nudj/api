/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Query.companyTasksByFilters', () => {
  it('should fetch filtered companyTasks', async () => {
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
      query {
        companyTasksByFilters(filters: {
          id: "companyTask2"
        }) {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        companyTasksByFilters: [
          {
            id: 'companyTask2'
          }
        ]
      }
    })
  })

  it('should return empty array if no matches', async () => {
    const db = {
      companyTasks: []
    }
    const operation = `
      query {
        companyTasksByFilters(filters: {
          id: "companyTask2"
        }) {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        companyTasksByFilters: []
      }
    })
  })
})
