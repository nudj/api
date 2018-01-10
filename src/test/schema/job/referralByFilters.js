/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Job.referralByFilters', () => {
  it('should fetch filtered referral', async () => {
    const db = {
      jobs: [
        {
          id: 'job1'
        }
      ],
      referrals: [
        {
          id: 'referral1',
          job: 'job1',
          person: 'person1'
        },
        {
          id: 'referral2',
          job: 'job2',
          person: 'person2'
        },
        {
          id: 'referral3',
          job: 'job1',
          person: 'person2'
        }
      ]
    }
    const operation = `
      query {
        job (id: "job1") {
          referralByFilters(filters: {
            person: "person2"
          }) {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        job: {
          referralByFilters: {
            id: 'referral3'
          }
        }
      }
    })
  })

  it('should return null if no matches', async () => {
    const db = {
      jobs: [
        {
          id: 'job1'
        }
      ],
      referrals: [
        {
          id: 'referral1',
          job: 'job1',
          person: 'person1'
        },
        {
          id: 'referral2',
          job: 'job1',
          person: 'person2'
        },
        {
          id: 'referral3',
          job: 'job2',
          person: 'person2'
        }
      ]
    }
    const operation = `
      query {
        job (id: "job1") {
          referralByFilters(filters: {
            person: "person3"
          }) {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        job: {
          referralByFilters: null
        }
      }
    })
  })
})
