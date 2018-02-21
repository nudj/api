/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Person.referralByFilters', () => {
  it('should fetch filtered referral', async () => {
    const db = {
      people: [
        {
          id: 'person1'
        }
      ],
      referrals: [
        {
          id: 'referral1',
          person: 'person1',
          job: 'job1'
        },
        {
          id: 'referral2',
          person: 'person2',
          job: 'job2'
        }
      ]
    }
    const operation = `
      query {
        person (id: "person1") {
          referralByFilters(filters: {
            job: "job1"
          }) {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        person: {
          referralByFilters: {
            id: 'referral1'
          }
        }
      }
    })
  })

  it('should return null if no matches', async () => {
    const db = {
      people: [
        {
          id: 'person1'
        }
      ],
      referrals: [
        {
          id: 'referral1',
          person: 'person1',
          job: 'job1'
        },
        {
          id: 'referral2',
          person: 'person2',
          job: 'job2'
        }
      ]
    }
    const operation = `
      query {
        person (id: "person1") {
          referralByFilters(filters: {
            job: "job2"
          }) {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        person: {
          referralByFilters: null
        }
      }
    })
  })
})
