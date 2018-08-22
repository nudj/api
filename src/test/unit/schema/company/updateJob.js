/* eslint-env mocha */
const chai = require('chai')
const sinon = require('sinon')
const nock = require('nock')
const qs = require('qs')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { values: tagTypes } = require('../../../../gql/schema/enums/tag-types')
const { values: tagSources } = require('../../../../gql/schema/enums/tag-sources')
const { values: jobStatusTypes } = require('../../../../gql/schema/enums/job-status-types')
const { executeQueryOnDbUsingSchema, shouldRespondWithGqlError } = require('../../helpers')

const operation = `
  mutation UpdateJob(
    $companyId: ID!
    $id: ID!
    $data: JobUpdateInput!
    $notifyTeam: Boolean
  ) {
    company(id: $companyId) {
      id
      updateJob(
        id: $id
        data: $data
        notifyTeam: $notifyTeam
      ) {
        id
        slug
      }
    }
  }
`
const mailerStub = sinon.stub()

describe('Company.updateJob', () => {
  let dbBase

  beforeEach(() => {
    dbBase = {
      companies: [
        {
          id: 'company1',
          name: 'Company One'
        }
      ],
      jobs: [
        {
          id: 'job1',
          company: 'company1',
          title: 'cheese',
          slug: 'cheese',
          status: jobStatusTypes.DRAFT,
          bonus: '£500'
        }
      ],
      tags: [],
      jobTags: [],
      hirers: [
        {
          id: 'hirer1',
          person: 'person1',
          company: 'company1',
          onboarded: true
        },
        {
          id: 'hirer2',
          person: 'person2',
          company: 'company1',
          onboarded: false
        },
        {
          id: 'hirer3',
          person: 'person3',
          company: 'company1',
          onboarded: true
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
    nock('https://api.mailgun.net')
      .persist()
      .filteringRequestBody(body => {
        mailerStub(qs.parse(body))
        return true
      })
      .post(() => true)
      .reply(200, 'OK')
  })
  afterEach(() => {
    mailerStub.reset()
    nock.cleanAll()
  })

  describe('when new tags are added', () => {
    it('should update the job', async () => {
      const db = {
        ...dbBase
      }

      const variables = {
        companyId: 'company1',
        id: 'job1',
        data: {
          tags: ['CEO'],
          description: 'SpaceX was founded under the belief that a future where humanity...'
        }
      }

      await executeQueryOnDbUsingSchema({ operation, db, schema, variables })

      expect(db.jobs).to.deep.equal([{
        id: 'job1',
        company: 'company1',
        title: 'cheese',
        slug: 'cheese',
        description: 'SpaceX was founded under the belief that a future where humanity...',
        status: jobStatusTypes.DRAFT,
        bonus: '£500'
      }])
    })

    it('should create the relevant tags', async () => {
      const db = {
        ...dbBase
      }

      const variables = {
        companyId: 'company1',
        id: 'job1',
        data: {
          title: 'CEO',
          tags: ['CEO', 'FOUNDER'],
          slug: 'ceo',
          description: 'SpaceX was founded under the belief that a future where humanity...'
        }
      }

      await executeQueryOnDbUsingSchema({ operation, db, schema, variables })

      expect(db.tags).to.deep.equal([
        {
          id: 'tag1',
          name: 'CEO',
          type: 'EXPERTISE'
        },
        {
          id: 'tag2',
          name: 'FOUNDER',
          type: 'EXPERTISE'
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

    it('should not create pre-existing tags', async () => {
      const db = {
        ...dbBase,
        tags: [
          {
            id: 'tag1',
            name: 'CEO',
            type: 'EXPERTISE'
          }
        ],
        jobTags: [
          {
            id: 'jobTag1',
            source: tagSources.NUDJ,
            job: 'job1',
            tag: 'tag1'
          }
        ]
      }

      const variables = {
        companyId: 'company1',
        id: 'job1',
        data: {
          title: 'CEO',
          tags: ['CEO', 'FOUNDER'],
          slug: 'ceo',
          description: 'SpaceX was founded under the belief that a future where humanity...'
        }
      }

      await executeQueryOnDbUsingSchema({ operation, db, schema, variables })

      expect(db.tags).to.deep.equal([
        {
          id: 'tag1',
          name: 'CEO',
          type: 'EXPERTISE'
        },
        {
          id: 'tag2',
          name: 'FOUNDER',
          type: 'EXPERTISE'
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

    it('should error if given invalid tags', async () => {
      const db = {
        ...dbBase
      }
      const badVariables = {
        companyId: 'company1',
        id: 'job1',
        data: {
          title: 'CEO',
          tags: ['bad'],
          slug: 'ceo',
          description: 'SpaceX was founded under the belief that a future where humanity...'
        }
      }

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
  })

  describe('when old tags are removed', () => {
    let db
    const variables = {
      companyId: 'company1',
      id: 'job1',
      data: {
        title: 'CEO',
        tags: ['CEO'],
        slug: 'ceo',
        description: 'SpaceX was founded under the belief that a future where humanity...'
      }
    }

    beforeEach(() => {
      db = {
        companies: [
          {
            id: 'company1'
          }
        ],
        jobs: [
          {
            id: 'job1',
            company: 'company1',
            slug: 'cheese'
          }
        ],
        tags: [
          {
            id: 'tag1',
            name: 'founder',
            type: tagTypes.EXPERTISE
          },
          {
            id: 'tag2',
            name: 'finance',
            type: tagTypes.EXPERTISE
          }
        ],
        jobTags: [
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
        ]
      }
    })

    it('should update the job', async () => {
      await executeQueryOnDbUsingSchema({ operation, db, schema, variables })

      expect(db.jobs).to.deep.equal([{
        id: 'job1',
        company: 'company1',
        title: 'CEO',
        slug: 'ceo',
        description: 'SpaceX was founded under the belief that a future where humanity...'
      }])
    })

    it('should delete unused jobTags', async () => {
      await executeQueryOnDbUsingSchema({ operation, db, schema, variables })

      expect(db.jobTags).to.deep.equal([
        {
          id: 'jobTag1',
          source: tagSources.NUDJ,
          job: 'job1',
          tag: 'tag3'
        }
      ])
    })
  })

  describe('when the company has another job with the same slug', () => {
    it('should not update the job and error', async () => {
      const db = {
        ...dbBase,
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

  describe('when old Job.status is DRAFT and new Job.status is PUBLISHED', () => {
    let db

    beforeEach(async () => {
      db = {
        ...dbBase,
        jobs: [
          {
            id: 'job1',
            company: 'company1',
            title: 'cheese',
            slug: 'draft-12345678',
            status: jobStatusTypes.DRAFT,
            bonus: '£500'
          }
        ]
      }

      const variables = {
        companyId: 'company1',
        id: 'job1',
        data: {
          status: jobStatusTypes.PUBLISHED
        }
      }

      await executeQueryOnDbUsingSchema({ operation, db, schema, variables })
    })

    it('should set the status to PUBLISHED', async () => {
      expect(db.jobs[0].status).to.equal(jobStatusTypes.PUBLISHED)
    })

    it('should set the sharable slug', async () => {
      expect(db.jobs[0].slug).to.equal('cheese')
    })
  })

  describe('when notifyTeam is true and old Job.status is not PUBLISHED and new Job.status is PUBLISHED', () => {
    it('should notify team mates', async () => {
      const db = {
        ...dbBase
      }

      const variables = {
        companyId: 'company1',
        id: 'job1',
        data: {
          title: 'CEO',
          slug: 'ceo',
          description: 'SpaceX was founded under the belief that a future where humanity...',
          status: jobStatusTypes.PUBLISHED
        },
        notifyTeam: true
      }

      await executeQueryOnDbUsingSchema({ operation, db, schema, variables })

      expect(mailerStub).to.have.been.calledOnce()

      const callArgs = mailerStub.getCall(0).args[0]
      expect(callArgs).to.have.property('to', 'person3@nudj.co')
      expect(callArgs).to.have.property('subject', 'New jobs on nudj!')
      expect(callArgs).to.have.property('html')
    })
  })

  describe('when notifyTeam is true but new Job.status is not PUBLISHED', () => {
    it('should not notify team mates', async () => {
      const db = {
        ...dbBase
      }

      const variables = {
        companyId: 'company1',
        id: 'job1',
        data: {
          title: 'CEO',
          slug: 'ceo',
          description: 'SpaceX was founded under the belief that a future where humanity...',
          status: jobStatusTypes.DRAFT
        },
        notifyTeam: true
      }

      await executeQueryOnDbUsingSchema({ operation, db, schema, variables })

      expect(mailerStub).to.not.have.been.called()
    })
  })

  describe('when notifyTeam is true but old Job.status is PUBLISHED', () => {
    it('should not notify team mates', async () => {
      const db = {
        ...dbBase,
        jobs: [
          {
            id: 'job1',
            company: 'company1',
            slug: 'cheese',
            status: jobStatusTypes.PUBLISHED,
            bonus: '£500'
          }
        ]
      }

      const variables = {
        companyId: 'company1',
        id: 'job1',
        data: {
          title: 'CEO',
          slug: 'ceo',
          description: 'SpaceX was founded under the belief that a future where humanity...',
          status: jobStatusTypes.PUBLISHED
        },
        notifyTeam: true
      }

      await executeQueryOnDbUsingSchema({ operation, db, schema, variables })

      expect(mailerStub).to.not.have.been.called()
    })
  })
})
