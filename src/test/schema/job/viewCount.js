/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Job.viewCount', () => {
  it('should return the jobs\'s viewCount', () => {
    const db = {
      jobs: [{
        id: 'job1',
        viewCount: 1
      }, {
        id: 'job2',
        viewCount: 9
      }]
    }

    const operation = `
      query {
        job(id: "job1") {
          id
          viewCount
        }
      }
    `

    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        job: {
          id: 'job1',
          viewCount: 1
        }
      }
    })
  })

  it('should return 0 if the viewCount doesn\'t have a value', () => {
    const db = {
      jobs: [{
        id: 'job1'
      }]
    }

    const operation = `
      query {
        job(id: "job1") {
          id
          viewCount
        }
      }
    `

    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        job: {
          id: 'job1',
          viewCount: 0
        }
      }
    })
  })
})
