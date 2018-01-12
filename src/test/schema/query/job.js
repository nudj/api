/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Query.job', () => {
  it('should fetch a single job', async () => {
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
    const operation = `
      query ($id: ID!) {
        job(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'job2'
    }
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        job: {
          id: 'job2'
        }
      }
    })
  })

  it('should return null if no match', async () => {
    const db = {
      jobs: []
    }
    const operation = `
      query ($id: ID!) {
        job(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'job2'
    }

    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        job: null
      }
    })
  })
})
