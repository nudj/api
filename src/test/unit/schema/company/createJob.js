/* eslint-env mocha */
const find = require('lodash/find')
const chai = require('chai')
const sinon = require('sinon')
const nock = require('nock')
const qs = require('qs')
const expect = chai.expect

const { merge } = require('@nudj/library')

const { values: tagTypes } = require('../../../../gql/schema/enums/tag-types')
const { values: tagSources } = require('../../../../gql/schema/enums/tag-sources')
const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

const operation = `
  mutation CreateJob(
    $companyId: ID!
    $data: JobCreateInput!
    $notifyTeam: Boolean
  ) {
    company(id: $companyId) {
      id
      createJob(
        data: $data
        notifyTeam: $notifyTeam
      ) {
        id
        slug
      }
    }
  }
`

const baseDb = {
  companies: [
    {
      id: 'company1',
      name: 'Company One'
    }
  ],
  tags: [],
  jobTags: [],
  hirers: [
    {
      id: 'hirer1',
      person: 'person1',
      company: 'company1'
    },
    {
      id: 'hirer2',
      person: 'person2',
      company: 'company1'
    },
    {
      id: 'hirer3',
      person: 'person3',
      company: 'company1'
    }
  ],
  people: [
    {
      id: 'person1',
      email: 'person1@nudj.co',
      firstName: 'Person1'
    },
    {
      id: 'person2',
      email: 'person2@nudj.co',
      firstName: 'Person2'
    },
    {
      id: 'person3',
      email: 'person3@nudj.co',
      firstName: 'Person3'
    }
  ]
}

const mailerStub = sinon.stub()

describe('Company.createJob', () => {
  let variables

  beforeEach(() => {
    nock('https://api.mailgun.net')
      .persist()
      .filteringRequestBody(body => {
        mailerStub(qs.parse(body))
        return true
      })
      .post(() => true)
      .reply(200, 'OK')
    variables = {
      companyId: 'company1',
      data: {
        title: 'CEO',
        slug: 'ceo',
        description: 'SpaceX was founded under the belief that a future where humanity is out exploring the stars is fundamentally more exciting than one where we are not.',
        bonus: '10',
        location: 'Mars',
        remuneration: '100000',
        status: 'PUBLISHED',
        template: 'film',
        tags: ['CEO', 'FOUNDER'],
        url: 'http://www.spacex.com/careers/position/215244'
      }
    }
  })
  afterEach(() => {
    mailerStub.reset()
    nock.cleanAll()
  })

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
      location: 'Mars',
      remuneration: '100000',
      status: 'PUBLISHED',
      template: 'film',
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

  describe('when notifyTeam flag is true and job.status === PUBLISHED', () => {
    it('should send notification emails to every team mate', async () => {
      const db = {
        ...baseDb,
        tags: [],
        jobTags: [],
        jobs: []
      }
      variables.notifyTeam = true

      await executeQueryOnDbUsingSchema({ operation, db, schema, variables })

      expect(mailerStub).to.have.been.calledTwice()

      const firstCallArgs = mailerStub.getCall(0).args[0]
      expect(firstCallArgs).to.have.property('from', 'hello@nudj.co')
      expect(firstCallArgs).to.have.property('to', 'person2@nudj.co')
      expect(firstCallArgs).to.have.property('subject', 'New jobs on nudj!')
      expect(firstCallArgs).to.have.property('html')

      const secondCallArgs = mailerStub.getCall(1).args[0]
      expect(secondCallArgs).to.have.property('from', 'hello@nudj.co')
      expect(secondCallArgs).to.have.property('to', 'person3@nudj.co')
      expect(secondCallArgs).to.have.property('subject', 'New jobs on nudj!')
      expect(secondCallArgs).to.have.property('html')
    })
  })
})
