/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Mutation.personTask', () => {
  it('should fetch a single personTask', async () => {
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
      mutation ($id: ID!) {
        personTask(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'personTask2'
    }
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        personTask: {
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
      mutation ($id: ID!) {
        personTask(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'personTask2'
    }

    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        personTask: null
      }
    })
  })
})
