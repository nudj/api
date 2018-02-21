/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Company.jobsByFilters', () => {
  it('should fetch filtered jobs', async () => {
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
          company: 'company1',
          status: 'PUBLISHED'
        },
        {
          id: 'job2',
          slug: 'jobSlug2',
          company: 'company1',
          status: 'PUBLISHED'
        },
        {
          id: 'job3',
          slug: 'jobSlug2',
          company: 'company2',
          status: 'PUBLISHED'
        }
      ]
    }
    const operation = `
      query testQuery ($companyId: ID!, $status: JobStatus!) {
        company (id: $companyId) {
          jobsByFilters(filters: {
            status: $status
          }) {
            id
            status
          }
        }
      }
    `

    const variables = {
      companyId: 'company1',
      status: 'PUBLISHED'
    }

    return expect(
      executeQueryOnDbUsingSchema({ operation, db, schema, variables })
    ).to.eventually.deep.equal({
      data: {
        company: {
          jobsByFilters: [
            {
              id: 'job1',
              status: 'PUBLISHED'
            },
            {
              id: 'job2',
              status: 'PUBLISHED'
            }
          ]
        }
      }
    })
  })

  it('should return an empty array if no matches', async () => {
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
          jobsByFilters(filters: {
            slug: "jobSlug3"
          }) {
            id
            slug
          }
        }
      }
    `
    return expect(
      executeQueryOnDbUsingSchema({ operation, db, schema })
    ).to.eventually.deep.equal({
      data: {
        company: {
          jobsByFilters: []
        }
      }
    })
  })
})
