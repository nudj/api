/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Job.viewCountByFilters', () => {
  it('should return total count of the jobViewEvents unique by browserId', () => {
    const db = {
      jobs: [
        {
          id: 'job1'
        }
      ]
    }
    const nosql = {
      jobViewEvents: [
        {
          job: 'job1',
          browserId: '123'
        },
        {
          job: 'jobFiveMillion',
          browserId: '123'
        },
        {
          job: 'job1',
          browserId: '456'
        }
      ]
    }

    const operation = `
      query {
        job(id: "job1") {
          id
          viewCountByFilters(filters: {})
        }
      }
    `

    return expect(executeQueryOnDbUsingSchema({ operation, db, nosql, schema })).to.eventually.deep.equal({
      data: {
        job: {
          id: 'job1',
          viewCountByFilters: 2
        }
      }
    })
  })

  it('should return 0 if the job has had no views', () => {
    const db = {
      jobs: [{
        id: 'job1'
      }]
    }
    const nosql = {
      jobViewEvents: []
    }

    const operation = `
      query {
        job(id: "job1") {
          id
          viewCountByFilters(filters: {})
        }
      }
    `

    return expect(executeQueryOnDbUsingSchema({ operation, db, nosql, schema })).to.eventually.deep.equal({
      data: {
        job: {
          id: 'job1',
          viewCountByFilters: 0
        }
      }
    })
  })

  it('should be filterable by date', () => {
    const db = {
      jobs: [{
        id: 'job1'
      }]
    }
    const nosql = {
      jobViewEvents: [
        {
          job: 'job1',
          browserId: '1',
          created: '2017-12-06 10:00:00'
        },
        {
          job: 'job1',
          browserId: '2',
          created: '2017-12-07 10:00:00'
        },
        {
          job: 'job1',
          browserId: '3',
          created: '2017-12-08 10:00:00'
        },
        {
          job: 'job1',
          browserId: '4',
          created: '2017-12-09 10:00:00'
        },
        {
          job: 'job1',
          browserId: '5',
          created: '2017-12-10 10:00:00'
        }
      ]
    }

    const operation = `
      query filteredViews ($to: DateTime, $from: DateTime) {
        job(id: "job1") {
          id
          viewCountByFilters(filters: { dateTo: $to, dateFrom: $from })
        }
      }
    `
    const variables = {
      from: '2017-12-07 10:00:00',
      to: '2017-12-09 10:00:00'
    }

    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, nosql, schema })).to.eventually.deep.equal({
      data: {
        job: {
          id: 'job1',
          viewCountByFilters: 3
        }
      }
    })
  })
})
