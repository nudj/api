/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Job.incrementViewCount', () => {
  it('should increment the number of views for the given job', () => {
    const db = {
      jobs: [{
        id: 'job1',
        viewCount: 0
      }]
    }

    const operation = `
      mutation incrementViewCount {
        job(id: "job1") {
          id
          incrementViewCount
        }
      }
    `

    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        job: {
          id: 'job1',
          incrementViewCount: 1
        }
      }
    })
  })
})
