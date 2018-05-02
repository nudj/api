/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const getDateString = (year, month, day) => (new Date(year, month, day)).toISOString().replace('T', ' ').replace('.000Z', '')

describe('Job.applicationsCountByFilters', () => {
  const olderDate = getDateString('1970', '01', '01')
  const newerDate = getDateString('1970', '01', '03')

  const db = {
    jobs: [{
      id: 'job1'
    }, {
      id: 'job2'
    }],
    applications: [{
      created: olderDate,
      id: 'app1',
      job: 'job1'
    }, {
      created: newerDate,
      id: 'app2',
      job: 'job1'
    }, {
      created: newerDate,
      id: 'app3',
      job: 'job2'
    }]
  }

  it('should fetch filtered applications', () => {
    const operation = `
      query ApplicationsCountByFiltersQuery($dateFrom: DateTime!) {
        job(id: "job1") {
          id
          applicationsCountByFilters(filters: { dateFrom: $dateFrom })
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
          applicationsCountByFilters: 1
        }
      }
    })
  })

  it('should return empty array if no matches', async () => {
    const operation = `
      query ApplicationsCountByFiltersQuery($dateFrom: DateTime!) {
        job(id: "job1") {
          id
          applicationsCountByFilters(filters: { dateFrom: $dateFrom })
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
          applicationsCountByFilters: 0
        }
      }
    })
  })
})
