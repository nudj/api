/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Job.applications', () => {
  it('should fetch all the applications relating to the job', () => {
    const db = {
      jobs: [{
        id: 'job1'
      }, {
        id: 'job2'
      }],
      applications: [{
        id: 'app1',
        job: 'job1'
      }, {
        id: 'app2',
        job: 'job1'
      }, {
        id: 'app3',
        job: 'job2'
      }]
    }

    const operation = `
      query {
        job(id: "job1") {
          id
          applications {
            id
          }
        }
      }
    `

    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        job: {
          id: 'job1',
          applications: [
            {
              id: 'app1'
            },
            {
              id: 'app2'
            }
          ]
        }
      }
    })
  })

  it('should return an empty array if job has no applications', () => {
    const db = {
      jobs: [{
        id: 'job1'
      }, {
        id: 'job2'
      }],
      applications: [{
        id: 'app1',
        job: 'job1'
      }, {
        id: 'app2',
        job: 'job1'
      }]
    }

    const operation = `
      query {
        job(id: "job2") {
          id
          applications {
            id
          }
        }
      }
    `

    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        job: {
          id: 'job2',
          applications: []
        }
      }
    })
  })
})
