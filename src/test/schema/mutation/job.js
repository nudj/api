/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('Mutation.job', () => {
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
    const mutation = `
      mutation ($id: ID!) {
        job(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'job2'
    }
    return expect(executeQueryOnDbUsingSchema({ mutation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        job: {
          id: 'job2'
        }
      }
    })
  })

  it('should return null and error if no match', async () => {
    const db = {
      jobs: []
    }
    const mutation = `
      mutation ($id: ID!) {
        job(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'job2'
    }

    return executeQueryOnDbUsingSchema({ mutation, variables, db, schema })
      .then(shouldRespondWithGqlError({
        message: 'NotFound',
        path: ['job']
      }))
  })
})
