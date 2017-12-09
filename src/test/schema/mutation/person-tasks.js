/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Mutation.personTasks', () => {
  it('should fetch all personTasks', async () => {
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
    const mutation = `
      mutation {
        personTasks {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ mutation, db, schema })).to.eventually.deep.equal({
      data: {
        personTasks: [
          {
            id: 'personTask1'
          },
          {
            id: 'personTask2'
          }
        ]
      }
    })
  })

  it('should return empty array if no matches', async () => {
    const db = {
      personTasks: []
    }
    const mutation = `
      mutation {
        personTasks {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ mutation, db, schema })).to.eventually.deep.equal({
      data: {
        personTasks: []
      }
    })
  })
})
