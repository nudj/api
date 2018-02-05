/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Job.referralsByFilters', () => {
  const getOlderDate = () => (new Date('1970', '01', '01')).toISOString()
  const getNewerDate = () => (new Date('1970', '01', '03')).toISOString()

  const db = {
    jobs: [{
      id: 'job1'
    }, {
      id: 'job2'
    }],
    referrals: [{
      created: getOlderDate(),
      id: 'referral1',
      job: 'job1'
    }, {
      created: getNewerDate(),
      id: 'referral2',
      job: 'job1'
    }, {
      created: getNewerDate(),
      id: 'referral3',
      job: 'job2'
    }]
  }

  it('should fetch filtered referrals', () => {
    const operation = `
      query ReferralsByFiltersQuery($dateFrom: DateTime!) {
        job(id: "job1") {
          id
          referralsByFilters(filters: {
            dateFrom: $dateFrom
          }) {
            id
          }
        }
      }
    `

    const variables = {
      dateFrom: (new Date('1970', '01', '02')).toISOString()
    }

    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        job: {
          id: 'job1',
          referralsByFilters: [
            {
              id: 'referral2'
            }
          ]
        }
      }
    })
  })

  it('should return empty array if no matches', async () => {
    const operation = `
      query ReferralsByFiltersQuery($dateFrom: DateTime!) {
        job(id: "job1") {
          id
          referralsByFilters(filters: {
            dateFrom: $dateFrom
          }) {
            id
          }
        }
      }
    `

    const variables = {
      dateFrom: (new Date('1970', '01', '05')).toISOString()
    }

    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        job: {
          id: 'job1',
          referralsByFilters: []
        }
      }
    })
  })
})
