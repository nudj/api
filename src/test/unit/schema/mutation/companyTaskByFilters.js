/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Mutation.companyTaskByFilters', () => {
  it('should fetch first filtered companyTask', async () => {
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
        companyTaskByFilters (filters: {
          id: $id
        }) {
          id
        }
      }
    `
    const variables = {
      id: 'companyTask2'
    }
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        companyTaskByFilters: {
          id: 'companyTask2'
        }
      }
    })
  })

  it('should return null if no match', async () => {
    const db = {
      companyTasks: []
    }
    const operation = `
      mutation ($id: ID!) {
        companyTaskByFilters (filters: {
          id: $id
        }) {
          id
        }
      }
    `
    const variables = {
      id: 'companyTask2'
    }
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        companyTaskByFilters: null
      }
    })
  })
})
