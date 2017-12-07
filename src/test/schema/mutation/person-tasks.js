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
    const query = `
      mutation {
        personTasks {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ query, db, schema })).to.eventually.deep.equal({
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
    const query = `
      mutation {
        personTasks {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ query, db, schema })).to.eventually.deep.equal({
      data: {
        personTasks: []
      }
    })
  })
})