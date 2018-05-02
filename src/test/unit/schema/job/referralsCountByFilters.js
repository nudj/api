/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const getDateString = (year, month, day) => (new Date(year, month, day)).toISOString().replace('T', ' ').replace('.000Z', '')

describe('Job.referralsCountByFilters', () => {
  const olderDate = getDateString('1970', '01', '01')
  const newerDate = getDateString('1970', '01', '03')

  const db = {
    jobs: [{
      id: 'job1'
    }, {
      id: 'job2'
    }],
    referrals: [{
      created: olderDate,
      id: 'referral1',
      job: 'job1'
    }, {
      created: newerDate,
      id: 'referral2',
      job: 'job1'
    }, {
      created: newerDate,
      id: 'referral3',
      job: 'job2'
    }]
  }

  it('should fetch filtered referralsCount', () => {
    const operation = `
      query ReferralsCountByFiltersQuery($dateFrom: DateTime!) {
        job(id: "job1") {
          id
          referralsCountByFilters(filters: { dateFrom: $dateFrom })
        }
      }
    `

    const variables = {
      dateFrom: getDateString('1970', '01', '02')
    }

    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        job: {
          id: 'job1',
          referralsCountByFilters: 1
        }
      }
    })
  })

  it('should return empty array if no matches', async () => {
    const operation = `
      query ReferralsCountByFiltersQuery($dateFrom: DateTime!) {
        job(id: "job1") {
          id
          referralsCountByFilters(filters: { dateFrom: $dateFrom })
        }
      }
    `

    const variables = {
      dateFrom: getDateString('1970', '01', '05')
    }

    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        job: {
          id: 'job1',
          referralsCountByFilters: 0
        }
      }
    })
  })
})
