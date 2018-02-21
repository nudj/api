/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Job.applicationsCountByFilters', () => {
  const getOlderDate = () => (new Date('1970', '01', '01')).toISOString()
  const getNewerDate = () => (new Date('1970', '01', '03')).toISOString()

  const db = {
    jobs: [{
      id: 'job1'
    }, {
      id: 'job2'
    }],
    applications: [{
      created: getOlderDate(),
      id: 'app1',
      job: 'job1'
    }, {
      created: getNewerDate(),
      id: 'app2',
      job: 'job1'
    }, {
      created: getNewerDate(),
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
      dateFrom: (new Date('1970', '01', '02')).toISOString()
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
      dateFrom: (new Date('1970', '01', '05')).toISOString()
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
