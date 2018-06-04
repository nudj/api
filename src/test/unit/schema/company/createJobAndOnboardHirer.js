/* eslint-env mocha */
const find = require('lodash/find')
const chai = require('chai')
const expect = chai.expect

const { merge } = require('@nudj/library')

const { values: tagTypes } = require('../../../../gql/schema/enums/tag-types')
const { values: tagSources } = require('../../../../gql/schema/enums/tag-sources')
const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

const operation = `
  mutation CreateFirstJob($companyId: ID!, $data: JobCreateInput!) {
    company(id: $companyId) {
      id
      createJobAndOnboardHirer(data: $data) {
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
  people: [
    {
      id: 'person1'
    }
  ],
  hirers: [
    {
      id: 'hirer1',
      company: 'company1',
      person: 'person1',
      onboarded: false
    }
  ],
  tags: [],
  jobTags: []
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
    tags: ['CEO', 'FOUNDER'],
    type: 'Permanent',
    url: 'http://www.spacex.com/careers/position/215244'
  }
}

describe('Company.createJobAndOnboardHirer', () => {
  it('should create the related tags and jobTags', async () => {
    const db = {
      ...baseDb,
      tags: [],
      jobTags: [],
      jobs: []
    }

    await executeQueryOnDbUsingSchema({ operation, db, schema, variables })

    expect(db.tags).to.deep.equal([
      {
        id: 'tag1',
        name: 'CEO',
        type: tagTypes.EXPERTISE
      },
      {
        id: 'tag2',
        name: 'FOUNDER',
        type: tagTypes.EXPERTISE
      }
    ])
    expect(db.jobTags).to.deep.equal([
      {
        id: 'jobTag1',
        source: tagSources.NUDJ,
        job: 'job1',
        tag: 'tag1'
      },
      {
        id: 'jobTag2',
        source: tagSources.NUDJ,
        job: 'job1',
        tag: 'tag2'
      }
    ])
  })

  it('should create the job', async () => {
    const db = {
      ...baseDb,
      tags: [],
      jobTags: [],
      jobs: []
    }

    await executeQueryOnDbUsingSchema({ operation, db, schema, variables })

    expect(db.jobs[0]).to.deep.equal({
      id: 'job1',
      company: 'company1',
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
    })
  })

  it('should generate a unique job slug', async () => {
    const db = {
      ...baseDb,
      tags: [],
      jobTags: [],
      jobs: [
        {
          id: 'job1',
          title: 'Special Conflicting Job',
          company: 'company1',
          slug: 'ceo'
        }
      ]
    }

    await executeQueryOnDbUsingSchema({ operation, db, schema, variables })

    const { slug } = find(db.jobs, { id: 'job2' })

    expect(slug).to.not.equal('ceo')
    expect(slug).to.be.a('string')
    expect(slug).to.match(/ceo-[a-z0-9]{8}/)
  })

  it('should error if given invalid tags', async () => {
    const db = {
      ...baseDb,
      tags: [],
      jobTags: [],
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

  describe('when the job is created successfully', () => {
    it('sets the hirer as onboarded', async () => {
      const db = {
        ...baseDb,
        tags: [],
        jobTags: [],
        jobs: [],
        hirers: [
          {
            id: 'hirer1',
            company: 'company1',
            person: 'person1',
            onboarded: false
          }
        ]
      }

      await executeQueryOnDbUsingSchema({ operation, db, schema, variables })
      expect(db.hirers[0]).to.have.property('onboarded').to.be.true()
    })
  })

  describe('when the job is not created successfully', () => {
    it('does not set the hirer as onboarded', async () => {
      const db = {
        ...baseDb,
        tags: [],
        jobTags: [],
        jobs: [],
        hirers: [
          {
            id: 'hirer1',
            company: 'company1',
            person: 'person1',
            onboarded: false
          }
        ]
      }
      const badVariables = merge(variables, {
        data: {
          title: null
        }
      })

      await executeQueryOnDbUsingSchema({
        operation,
        variables: badVariables,
        db,
        schema
      })
      expect(db.hirers[0]).to.have.property('onboarded').to.be.false()
    })
  })
})
