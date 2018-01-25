/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Job.incrementViews', () => {
  it('should increment the number of views for the given job', () => {
    const db = {
      jobs: [{
        id: 'job1',
        views: 0
      }]
    }

    const operation = `
      mutation incrementViews {
        job(id: "job1") {
          id
          incrementViews
        }
      }
    `

    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        job: {
          id: 'job1',
          incrementViews: 1
        }
      }
    })
  })
})