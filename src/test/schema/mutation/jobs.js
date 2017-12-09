/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Mutation.jobs', () => {
  it('should fetch all jobs', async () => {
    const db = {
      jobs: [
        {
          id: 'job1'
        },
        {
          id: 'job2'
        }
      ]
    }
    const mutation = `
      mutation {
        jobs {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ mutation, db, schema })).to.eventually.deep.equal({
      data: {
        jobs: [
          {
            id: 'job1'
          },
          {
            id: 'job2'
          }
        ]
      }
    })
  })

  it('should return empty array if no matches', async () => {
    const db = {
      jobs: []
    }
    const mutation = `
      mutation {
        jobs {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ mutation, db, schema })).to.eventually.deep.equal({
      data: {
        jobs: []
      }
    })
  })
})
