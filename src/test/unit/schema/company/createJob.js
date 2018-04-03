/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const { merge } = require('@nudj/library')

const { values: tagTypes } = require('../../../../gql/schema/enums/tag-types')
const { values: tagSources } = require('../../../../gql/schema/enums/tag-sources')
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
  companies: [
    {
      id: 'company1'
    }
  ],
  tags: [],
  entityTags: []
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
    tags: ['ceo', 'founder'],
    type: 'Permanent',
    url: 'http://www.spacex.com/careers/position/215244'
  }
}

describe('Company.createJob', () => {
  it('should create the related tags and entityTags', async () => {
    const db = {
      ...baseDb,
      tags: [],
      entityTags: [],
      jobs: []
    }

    await executeQueryOnDbUsingSchema({ operation, db, schema, variables })

    expect(db.tags).to.deep.equal([
      {
        id: 'tag1',
        name: 'ceo',
        type: tagTypes.EXPERTISE
      },
      {
        id: 'tag2',
        name: 'founder',
        type: tagTypes.EXPERTISE
      }
    ])
    expect(db.entityTags).to.deep.equal([
      {
        entityId: 'job1',
        entityType: 'job',
        id: 'entityTag1',
        source: tagSources.NUDJ,
        tagId: 'tag1'
      },
      {
        entityId: 'job1',
        entityType: 'job',
        id: 'entityTag2',
        source: tagSources.NUDJ,
        tagId: 'tag2'
      }
    ])
  })

  it('should create the job', async () => {
    const db = {
      ...baseDb,
      tags: [],
      entityTags: [],
      jobs: []
    }

    await executeQueryOnDbUsingSchema({ operation, db, schema, variables })

    expect(db.jobs[0]).to.deep.equal({
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
    })
  })

  it('should error if given invalid tags', async () => {
    const db = {
      ...baseDb,
      tags: [],
      entityTags: [],
      jobs: []
    }
    const badVariables = merge(variables, {
      data: {
        tags: ['bad']
      }
    })

    const result = await executeQueryOnDbUsingSchema({
      operation,
      variables: badVariables,
      db,
      schema
    })
    expect(result.errors[0]).to.have.property('message').to.include(
      'Expected type "ExpertiseTagType", found "bad"'
    )
  })

  describe('when the company already has a job with provided `slug`', () => {
    it('should not create the job and throw', async () => {
      const db = {
        ...baseDb,
        tags: [],
        entityTags: [],
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
