/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Job.referrals', () => {
  it('should fetch all the referrals relating to the job', () => {
    const db = {
      jobs: [{
        id: 'job1'
      }, {
        id: 'job2'
      }],
      referrals: [{
        id: 'referral1',
        job: 'job1'
      }, {
        id: 'referral2',
        job: 'job1'
      }, {
        id: 'referral3',
        job: 'job2'
      }]
    }

    const operation = `
      query {
        job(id: "job1") {
          id
          referrals {
            id
          }
        }
      }
    `

    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        job: {
          id: 'job1',
          referrals: [
            {
              id: 'referral1'
            },
            {
              id: 'referral2'
            }
          ]
        }
      }
    })
  })

  it('should return an empty array if job has no referrals', () => {
    const db = {
      jobs: [{
        id: 'job1'
      }, {
        id: 'job2'
      }],
      referrals: [{
        id: 'referral1',
        job: 'job1'
      }, {
        id: 'referral2',
        job: 'job1'
      }]
    }

    const operation = `
      query {
        job(id: "job2") {
          id
          referrals {
            id
          }
        }
      }
    `

    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        job: {
          id: 'job2',
          referrals: []
        }
      }
    })
  })
})