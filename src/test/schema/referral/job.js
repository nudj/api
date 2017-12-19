/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('Referral.job', () => {
  it('should fetch filtered job', async () => {
    const db = {
      referrals: [
        {
          id: 'referral1',
          job: 'job2'
        }
      ],
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
        referral (id: "referral1") {
          job {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        referral: {
          job: {
            id: 'job2'
          }
        }
      }
    })
  })

  it('should return null and error if no matches', async () => {
    const db = {
      referrals: [
        {
          id: 'referral1',
          job: 'job3'
        }
      ],
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
        referral (id: "referral1") {
          job {
            id
          }
        }
      }
    `
    return executeQueryOnDbUsingSchema({ operation, db, schema })
      .then(shouldRespondWithGqlError({
        message: 'NotFound',
        path: [
          'referral',
          'job'
        ]
      }))
  })
})
