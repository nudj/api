/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Job.viewCountByFilters', () => {
  it('should return total count of the jobs\'s "viewed" events', () => {
    const db = {
      jobs: [
        {
          id: 'job1'
        }
      ],
      events: [
        {
          entityId: 'job1',
          eventType: 'viewed'
        },
        {
          entityId: 'job1',
          eventType: 'referred'
        },
        {
          entityId: 'job1',
          eventType: 'viewed'
        },
        {
          entityId: 'jobFiveMillion',
          eventType: 'viewed'
        },
        {
          entityId: 'job1',
          eventType: 'viewed'
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

    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        job: {
          id: 'job1',
          viewCountByFilters: 3
        }
      }
    })
  })

  it('should return 0 if the job has no "viewed" events', () => {
    const db = {
      jobs: [{
        id: 'job1'
      }],
      events: []
    }

    const operation = `
      query {
        job(id: "job1") {
          id
          viewCountByFilters(filters: {})
        }
      }
    `

    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
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
      }],
      events: [
        {
          entityId: 'job1',
          eventType: 'viewed',
          created: '2017-12-06T10:00:00.000Z'
        },
        {
          entityId: 'job1',
          eventType: 'viewed',
          created: '2017-12-07T10:00:00.000Z'
        },
        {
          entityId: 'job1',
          eventType: 'viewed',
          created: '2017-12-08T10:00:00.000Z'
        },
        {
          entityId: 'job1',
          eventType: 'viewed',
          created: '2017-12-09T10:00:00.000Z'
        },
        {
          entityId: 'job1',
          eventType: 'viewed',
          created: '2017-12-10T10:00:00.000Z'
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
      from: '2017-12-07T10:00:00.000Z',
      to: '2017-12-09T10:00:00.000Z'
    }

    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        job: {
          id: 'job1',
          viewCountByFilters: 3
        }
      }
    })
  })
})
