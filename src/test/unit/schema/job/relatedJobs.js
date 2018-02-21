/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const operation = `
  query {
    job(id: "job2") {
      id
      relatedJobs {
        id
      }
    }
  }
`

describe('Company.relatedJobs', () => {
  it('should fetch all relatedJobs for current the job', async () => {
    const db = {
      jobs: [
        {
          id: 'job1'
        },
        {
          id: 'job2',
          relatedJobs: ['job1']
        }
      ]
    }
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        job: {
          id: 'job2',
          relatedJobs: [
            {
              id: 'job1'
            }
          ]
        }
      }
    })
  })

  it('should return empty array if no matches', async () => {
    const db = {
      jobs: [
        {
          id: 'job1'
        },
        {
          id: 'job2',
          relatedJobs: []
        }
      ]
    }
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        job: {
          id: 'job2',
          relatedJobs: []
        }
      }
    })
  })
})
