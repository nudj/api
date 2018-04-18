/* eslint-env mocha */
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const orderBy = require('lodash/orderBy')
const {
  db,
  setupCollections,
  populateCollections,
  truncateCollections,
  teardownCollections,
  expect
} = require('../../lib')
const migration = require('../../../../migrations/00008-separate-entity-tags-collection')

chai.use(chaiAsPromised)

describe('00008 Separate Entity Tags Collection', () => {
  const SOURCE = 'NUDJ'

  const executeMigration = ({ direction }) => {
    return migration[direction]({
      db,
      step: (description, actions) => actions()
    })
  }

  beforeEach(async () => {
    await setupCollections(db, ['entityTags', 'surveyQuestions', 'jobs', 'tags'])
    await populateCollections(db, [
      {
        name: 'entityTags',
        data: [
          {
            id: 'entityTag1',
            entityType: 'surveyQuestion',
            entityId: 'surveyQuestion1',
            tagId: 'tag1',
            source: SOURCE
          },
          {
            id: 'entityTag2',
            entityType: 'job',
            entityId: 'job1',
            tagId: 'tag2',
            source: SOURCE
          }
        ]
      },
      {
        name: 'surveyQuestions',
        data: [
          {
            id: 'surveyQuestion1'
          }
        ]
      },
      {
        name: 'jobs',
        data: [
          {
            id: 'job1'
          }
        ]
      },
      {
        name: 'tags',
        data: [
          {
            id: 'tag1',
            name: 'DAVE_TAG'
          },
          {
            id: 'tag2',
            name: 'STEVE_TAG'
          }
        ]
      }
    ])
  })

  afterEach(async () => {
    await truncateCollections(db)
  })

  after(async () => {
    await teardownCollections(db)
  })

  describe('when direction up', () => {
    beforeEach(async () => {
      await executeMigration({ direction: 'up' })
    })

    it('should create the new collections', async () => {
      const [
        surveyQuestionTagsCollection,
        jobTagsCollection
      ] = await Promise.all([
        db.collection('surveyQuestionTags'),
        db.collection('jobTags')
      ])
      expect(surveyQuestionTagsCollection).to.exist()
      expect(jobTagsCollection).to.exist()
    })

    it('should remove the `entityTags` collection', async () => {
      try {
        const entityTagsCollection = await db.collection('entityTags')
        await entityTagsCollection.all()
        throw new Error('should not reach this error')
      } catch (error) {
        expect(error.message).to.equal('collection not found (entityTags)')
      }
    })

    describe('when entityTag is of `job` type', () => {
      it('should add tag to the `jobTags` collection', async () => {
        const jobTagsCollection = await db.collection('jobTags')
        const jobTagsCursor = await jobTagsCollection.all()
        const allJobTags = await jobTagsCursor.all()

        expect(allJobTags.length).to.equal(1)
        expect(allJobTags[0]).to.have.property('job').to.equal('job1')
        expect(allJobTags[0]).to.have.property('tag').to.equal('tag2')
        expect(allJobTags[0]).to.have.property('source').to.equal(SOURCE)
      })
    })

    describe('when entityTag is of `surveyQuestion` type', () => {
      it('should add tag to the `surveyQuestionTags` collection', async () => {
        const surveyQuestionTagsCollection = await db.collection('surveyQuestionTags')
        const surveyQuestionTagsCursor = await surveyQuestionTagsCollection.all()
        const allSurveyQuestionTags = await surveyQuestionTagsCursor.all()
        const firstTag = allSurveyQuestionTags[0]

        expect(allSurveyQuestionTags.length).to.equal(1)
        expect(firstTag).to.have.property('surveyQuestion').to.equal('surveyQuestion1')
        expect(firstTag).to.have.property('tag').to.equal('tag1')
        expect(firstTag).to.have.property('source').to.equal(SOURCE)
      })
    })
  })

  describe('when direction down', () => {
    beforeEach(async () => {
      await executeMigration({ direction: 'up' })
      await executeMigration({ direction: 'down' })
    })

    it('should remove the new collections', async () => {
      try {
        const jobTagsCollection = await db.collection('jobTags')
        await jobTagsCollection.all()
        throw new Error('should not reach this error')
      } catch (error) {
        expect(error.message).to.equal('collection not found (jobTags)')
      }

      try {
        const surveyQuestionTagsCollection = await db.collection('surveyQuestionTags')
        await surveyQuestionTagsCollection.all()
        throw new Error('should not reach this error')
      } catch (error) {
        expect(error.message).to.equal('collection not found (surveyQuestionTags)')
      }
    })

    it('should create the `entityTags` collection', async () => {
      const entityTagsCollection = await db.collection('entityTags')
      expect(entityTagsCollection).to.exist()
    })

    it('should repopulate the `entityTags` collection', async () => {
      const entityTagsCollection = await db.collection('entityTags')
      const entityTagsCursor = await entityTagsCollection.all()
      const entityTags = orderBy(await entityTagsCursor.all(), 'entityType')

      expect(entityTags.length).to.equal(2)

      expect(entityTags[0]).to.have.property('entityType').to.equal('job')
      expect(entityTags[0]).to.have.property('entityId').to.equal('job1')
      expect(entityTags[0]).to.have.property('tagId').to.equal('tag2')
      expect(entityTags[0]).to.have.property('source').to.equal(SOURCE)

      expect(entityTags[1]).to.have.property('entityType').to.equal('surveyQuestion')
      expect(entityTags[1]).to.have.property('entityId').to.equal('surveyQuestion1')
      expect(entityTags[1]).to.have.property('tagId').to.equal('tag1')
      expect(entityTags[1]).to.have.property('source').to.equal(SOURCE)
    })
  })
})
