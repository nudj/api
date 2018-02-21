/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Job.applicationByFilters', () => {
  it('should fetch filtered application', async () => {
    const db = {
      jobs: [
        {
          id: 'job1'
        }
      ],
      applications: [
        {
          id: 'application1',
          job: 'job1',
          person: 'person1'
        },
        {
          id: 'application2',
          job: 'job2',
          person: 'person2'
        },
        {
          id: 'application3',
          job: 'job1',
          person: 'person2'
        }
      ]
    }
    const operation = `
      query {
        job (id: "job1") {
          applicationByFilters(filters: {
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
          applicationByFilters: {
            id: 'application3'
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
      applications: [
        {
          id: 'application1',
          job: 'job1',
          person: 'person1'
        },
        {
          id: 'application2',
          job: 'job1',
          person: 'person2'
        },
        {
          id: 'application3',
          job: 'job2',
          person: 'person2'
        }
      ]
    }
    const operation = `
      query {
        job (id: "job1") {
          applicationByFilters(filters: {
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
          applicationByFilters: null
        }
      }
    })
  })
})
