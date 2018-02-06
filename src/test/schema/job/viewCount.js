/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Job.viewCount', () => {
  it('should return total count of the jobs\'s "viewed" events', () => {
    const db = {
      jobs: [
        {
          id: 'job1'
        }
      ],
      events: [
        {
          entityId: 'job1',
          eventType: 'viewed'
        },
        {
          entityId: 'job1',
          eventType: 'referred'
        },
        {
          entityId: 'job1',
          eventType: 'viewed'
        },
        {
          entityId: 'jobFiveMillion',
          eventType: 'viewed'
        },
        {
          entityId: 'job1',
          eventType: 'viewed'
        }
      ]
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
          viewCount: 3
        }
      }
    })
  })

  it('should return 0 if the job has no "viewed" events', () => {
    const db = {
      jobs: [{
        id: 'job1'
      }],
      events: []
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
