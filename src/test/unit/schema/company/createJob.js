/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema, shouldRespondWithGqlError } = require('../../helpers')

const operation = `
  mutation CreateJob($companyId: ID!, $data: JobCreateInput!) {
    company(id: $companyId) {
      id
      createJob(data: $data) {
        id
        slug
      }
    }
  }
`

const baseDb = {
  companies: [{
    id: 'company1'
  }]
}

const variables = {
  companyId: 'company1',
  data: {
    title: 'CEO',
    slug: 'ceo',
    description: 'SpaceX was founded under the belief that a future where humanity is out exploring the stars is fundamentally more exciting than one where we are not.',
    bonus: '10',
    roleDescription: 'Espresso machine proficiency',
    candidateDescription: 'A valid ServSafe or state issued food handler’s card',
    location: 'Mars',
    remuneration: '100000',
    status: 'PUBLISHED',
    templateTags: ['film'],
    type: 'Permanent',
    url: 'http://www.spacex.com/careers/position/215244'
  }
}

describe('Company.createJob', () => {
  it('should create the job', async () => {
    const db = {
      ...baseDb,
      jobs: []
    }

    await executeQueryOnDbUsingSchema({ operation, db, schema, variables })

    expect(db).to.deep.equal({
      companies: [{
        id: 'company1'
      }],
      jobs: [{
        id: 'job1',
        company: 'company1',
        title: 'CEO',
        slug: 'ceo',
        description: 'SpaceX was founded under the belief that a future where humanity is out exploring the stars is fundamentally more exciting than one where we are not.',
        bonus: 10,
        roleDescription: 'Espresso machine proficiency',
        candidateDescription: 'A valid ServSafe or state issued food handler’s card',
        location: 'Mars',
        remuneration: '100000',
        status: 'PUBLISHED',
        templateTags: ['film'],
        type: 'Permanent',
        url: 'http://www.spacex.com/careers/position/215244'
      }]
    })
  })

  describe('when the company already has a job with provided `slug`', () => {
    it('should not create the job and throw', async () => {
      const db = {
        ...baseDb,
        jobs: [{
          id: 'job1',
          slug: 'ceo',
          company: 'company1'
        }]
      }

      const result = await executeQueryOnDbUsingSchema({ operation, db, schema, variables })

      shouldRespondWithGqlError({
        path: ['company', 'createJob']
      })(result)

      expect(db.jobs.length).to.equal(1)
    })
  })
})
