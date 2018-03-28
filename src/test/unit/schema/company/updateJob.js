/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { values: tagTypes } = require('../../../../gql/schema/enums/tag-types')
const { values: tagSources } = require('../../../../gql/schema/enums/tag-sources')
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
  describe('when new tags are added', () => {
    it('should update the job', async () => {
      const db = {
        companies: [{
          id: 'company1'
        }],
        jobs: [{
          id: 'job1',
          company: 'company1',
          slug: 'cheese'
        }],
        tags: [],
        entityTags: []
      }

      const variables = {
        companyId: 'company1',
        id: 'job1',
        data: {
          title: 'CEO',
          tags: ['ceo'],
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

    it('should create the relevant tags', async () => {
      const db = {
        companies: [{
          id: 'company1'
        }],
        jobs: [{
          id: 'job1',
          company: 'company1',
          slug: 'cheese'
        }],
        tags: [],
        entityTags: []
      }

      const variables = {
        companyId: 'company1',
        id: 'job1',
        data: {
          title: 'CEO',
          tags: ['ceo', 'founder'],
          slug: 'ceo',
          description: 'SpaceX was founded under the belief that a future where humanity...'
        }
      }

      await executeQueryOnDbUsingSchema({ operation, db, schema, variables })

      expect(db.tags).to.deep.equal([
        {
          id: 'tag1',
          name: 'ceo',
          type: 'EXPERTISE'
        },
        {
          id: 'tag2',
          name: 'founder',
          type: 'EXPERTISE'
        }
      ])
      expect(db.entityTags).to.deep.equal([
        {
          entityId: 'job1',
          entityType: 'job',
          id: 'entityTag1',
          sourceId: null,
          sourceType: 'NUDJ',
          tagId: 'tag1'
        },
        {
          entityId: 'job1',
          entityType: 'job',
          id: 'entityTag2',
          sourceId: null,
          sourceType: 'NUDJ',
          tagId: 'tag2'
        }
      ])
    })

    it('should not create pre-existing tags', async () => {
      const db = {
        companies: [{
          id: 'company1'
        }],
        jobs: [{
          id: 'job1',
          company: 'company1',
          slug: 'cheese'
        }],
        tags: [
          {
            id: 'tag1',
            name: 'ceo',
            type: 'EXPERTISE'
          }
        ],
        entityTags: [
          {
            entityId: 'job1',
            entityType: 'job',
            id: 'entityTag1',
            sourceId: null,
            sourceType: 'NUDJ',
            tagId: 'tag1'
          }
        ]
      }

      const variables = {
        companyId: 'company1',
        id: 'job1',
        data: {
          title: 'CEO',
          tags: ['ceo', 'founder'],
          slug: 'ceo',
          description: 'SpaceX was founded under the belief that a future where humanity...'
        }
      }

      await executeQueryOnDbUsingSchema({ operation, db, schema, variables })

      expect(db.tags).to.deep.equal([
        {
          id: 'tag1',
          name: 'ceo',
          type: 'EXPERTISE'
        },
        {
          id: 'tag2',
          name: 'founder',
          type: 'EXPERTISE'
        }
      ])
      expect(db.entityTags).to.deep.equal([
        {
          entityId: 'job1',
          entityType: 'job',
          id: 'entityTag1',
          sourceId: null,
          sourceType: 'NUDJ',
          tagId: 'tag1'
        },
        {
          entityId: 'job1',
          entityType: 'job',
          id: 'entityTag2',
          sourceId: null,
          sourceType: 'NUDJ',
          tagId: 'tag2'
        }
      ])
    })

    it('should error if given invalid tags', async () => {
      const db = {
        companies: [{
          id: 'company1'
        }],
        jobs: [{
          id: 'job1',
          company: 'company1',
          slug: 'cheese'
        }],
        tags: [],
        entityTags: []
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
        tags: ['ceo'],
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
        entityTags: [
          {
            id: 'entityTag1',
            entityId: 'job1',
            entityType: 'job',
            sourceId: null,
            sourceType: tagSources.NUDJ,
            tagId: 'tag1'
          },
          {
            id: 'entityTag2',
            entityId: 'job1',
            entityType: 'job',
            sourceId: null,
            sourceType: tagSources.NUDJ,
            tagId: 'tag2'
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

    it('should delete unused entityTags', async () => {
      await executeQueryOnDbUsingSchema({ operation, db, schema, variables })

      expect(db.entityTags).to.deep.equal([
        {
          entityId: 'job1',
          entityType: 'job',
          id: 'entityTag1',
          sourceId: null,
          sourceType: 'NUDJ',
          tagId: 'tag3'
        }
      ])
    })
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
        }],
        tags: [],
        entityTags: []
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
