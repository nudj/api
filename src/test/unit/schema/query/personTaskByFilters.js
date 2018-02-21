/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Query.personTaskByFilters', () => {
  it('should fetch first filtered personTask', async () => {
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
    const operation = `
      query ($id: ID!) {
        personTaskByFilters (filters: {
          id: $id
        }) {
          id
        }
      }
    `
    const variables = {
      id: 'personTask2'
    }
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        personTaskByFilters: {
          id: 'personTask2'
        }
      }
    })
  })

  it('should return null if no match', async () => {
    const db = {
      personTasks: []
    }
    const operation = `
      query ($id: ID!) {
        personTaskByFilters (filters: {
          id: $id
        }) {
          id
        }
      }
    `
    const variables = {
      id: 'personTask2'
    }
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        personTaskByFilters: null
      }
    })
  })
})
