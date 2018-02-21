/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Company.jobByFilters', () => {
  it('should fetch filtered job', async () => {
    const db = {
      companies: [
        {
          id: 'company1'
        }
      ],
      jobs: [
        {
          id: 'job1',
          slug: 'jobSlug1',
          company: 'company1'
        },
        {
          id: 'job2',
          slug: 'jobSlug2',
          company: 'company1'
        },
        {
          id: 'job3',
          slug: 'jobSlug2',
          company: 'company2'
        }
      ]
    }
    const operation = `
      query {
        company (id: "company1") {
          jobByFilters(filters: {
            slug: "jobSlug2"
          }) {
            id
            slug
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        company: {
          jobByFilters: {
            id: 'job2',
            slug: 'jobSlug2'
          }
        }
      }
    })
  })

  it('should return null if no matches', async () => {
    const db = {
      companies: [
        {
          id: 'company1'
        }
      ],
      jobs: [
        {
          id: 'job1',
          slug: 'jobSlug1',
          company: 'company1'
        },
        {
          id: 'job2',
          slug: 'jobSlug2',
          company: 'company1'
        },
        {
          id: 'job3',
          slug: 'jobSlug3',
          company: 'company2'
        }
      ]
    }
    const operation = `
      query {
        company (id: "company1") {
          jobByFilters(filters: {
            slug: "jobSlug3"
          }) {
            id
            slug
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        company: {
          jobByFilters: null
        }
      }
    })
  })
})
