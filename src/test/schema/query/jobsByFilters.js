/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Query.jobsByFilters', () => {
  it('should fetch filtered jobs', async () => {
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
      query {
        jobsByFilters {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        jobsByFilters: [
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
    const operation = `
      query {
        jobsByFilters {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        jobsByFilters: []
      }
    })
  })
})
