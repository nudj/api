/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema, shouldRespondWithGqlError } = require('../../helpers')

const operation = `
  mutation UpdateJob($companyId: ID!, $id: ID!, $data: JobUpdateInput!) {
    company(id: $companyId) {
      id
      updateJob(id: $id, data: $data) {
        id
        slug
      }
    }
  }
`

describe('Company.updateJob', () => {
  it('should update the job', async () => {
    const db = {
      companies: [{
        id: 'company1'
      }],
      jobs: [{
        id: 'job1',
        company: 'company1',
        slug: 'cheese'
      }]
    }

    const variables = {
      companyId: 'company1',
      id: 'job1',
      data: {
        title: 'CEO',
        slug: 'ceo',
        description: 'SpaceX was founded under the belief that a future where humanity...'
      }
    }

    await executeQueryOnDbUsingSchema({ operation, db, schema, variables })

    expect(db.jobs).to.deep.equal([{
      id: 'job1',
      company: 'company1',
      title: 'CEO',
      slug: 'ceo',
      description: 'SpaceX was founded under the belief that a future where humanity...'
    }])
  })

  describe('when the company has another job with the same slug', () => {
    it('should not update the job and error', async () => {
      const db = {
        companies: [{
          id: 'company1'
        }],
        jobs: [{
          id: 'job1',
          company: 'company1',
          slug: 'cheese'
        }, {
          id: 'job2',
          company: 'company1',
          slug: 'ceo'
        }]
      }

      const variables = {
        companyId: 'company1',
        id: 'job1',
        data: {
          title: 'CEO',
          slug: 'ceo',
          description: 'SpaceX was founded under the belief that a future where humanity...'
        }
      }

      const result = await executeQueryOnDbUsingSchema({ operation, db, schema, variables })

      shouldRespondWithGqlError({
        path: ['company', 'updateJob']
      })(result)

      expect(db.jobs).to.deep.equal([{
        id: 'job1',
        company: 'company1',
        slug: 'cheese'
      }, {
        id: 'job2',
        company: 'company1',
        slug: 'ceo'
      }])
    })
  })
})
