/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('Person.createReferral', () => {
  const operation = `
    query testQuery (
      $jobId: ID!
      $parentId: ID
    ) {
      person (id: "person1") {
        createReferral(
          job: $jobId,
          parent: $parentId
        ) {
          id
        }
      }
    }
  `

  describe('when job exists and referral does not', () => {
    let db
    let result
    beforeEach(async () => {
      db = {
        people: [
          {
            id: 'person1'
          }
        ],
        jobs: [
          {
            id: 'job1',
            title: 'Job Title 1'
          }
        ],
        referrals: []
      }
      const variables = {
        jobId: 'job1'
      }
      result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
    })

    it('should create the referral', async () => {
      expect(db).to.have.deep.property('referrals.0')
      expect(db.referrals[0]).to.have.property('id', 'referral1')
      expect(db.referrals[0]).to.have.property('job', 'job1')
      expect(db.referrals[0]).to.have.property('person', 'person1')
      expect(db.referrals[0]).to.have.property('parent', null)
      expect(db.referrals[0]).to.have.property('slug').to.match(/^[a-z0-9]{10}$/)
    })

    it('should return the referral', async () => {
      expect(result).to.deep.equal({
        data: {
          person: {
            createReferral: {
              id: 'referral1'
            }
          }
        }
      })
    })
  })

  describe('when parent referral id is provided', () => {
    let db
    let result
    beforeEach(async () => {
      db = {
        people: [
          {
            id: 'person1'
          },
          {
            id: 'person2'
          }
        ],
        jobs: [
          {
            id: 'job1',
            title: 'Job Title 1'
          }
        ],
        referrals: [
          {
            id: 'referral1',
            job: 'job1',
            person: 'person2'
          }
        ]
      }
      const variables = {
        jobId: 'job1',
        parentId: 'referral1'
      }
      result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
    })

    it('should create the referral', async () => {
      expect(db).to.have.deep.property('referrals.1')
      expect(db.referrals[1]).to.have.property('id', 'referral2')
      expect(db.referrals[1]).to.have.property('job', 'job1')
      expect(db.referrals[1]).to.have.property('person', 'person1')
      expect(db.referrals[1]).to.have.property('parent', 'referral1')
      expect(db.referrals[1]).to.have.property('slug').to.match(/^[a-z0-9]{10}$/)
    })

    it('should return the referral', async () => {
      expect(result).to.deep.equal({
        data: {
          person: {
            createReferral: {
              id: 'referral2'
            }
          }
        }
      })
    })
  })

  describe('when parent referral id is provided but does not exist', () => {
    let db
    let result
    beforeEach(async () => {
      db = {
        people: [
          {
            id: 'person1'
          },
          {
            id: 'person2'
          }
        ],
        jobs: [
          {
            id: 'job1',
            title: 'Job Title 1'
          }
        ],
        referrals: []
      }
      const variables = {
        jobId: 'job1',
        parentId: 'referral1'
      }
      result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
    })

    it('should create the referral with null parent', async () => {
      expect(db).to.have.deep.property('referrals.0')
      expect(db.referrals[0]).to.have.property('id', 'referral1')
      expect(db.referrals[0]).to.have.property('job', 'job1')
      expect(db.referrals[0]).to.have.property('person', 'person1')
      expect(db.referrals[0]).to.have.property('parent', null)
      expect(db.referrals[0]).to.have.property('slug').to.match(/^[a-z0-9]{10}$/)
    })

    it('should return the referral with null parent', async () => {
      expect(result).to.deep.equal({
        data: {
          person: {
            createReferral: {
              id: 'referral1'
            }
          }
        }
      })
    })
  })

  describe('when referral already exists', () => {
    let db
    let result
    beforeEach(async () => {
      db = {
        people: [
          {
            id: 'person1'
          }
        ],
        jobs: [
          {
            id: 'job1',
            title: 'Job Title 1'
          }
        ],
        referrals: [
          {
            id: 'referral1',
            job: 'job1',
            person: 'person1'
          }
        ]
      }
      const variables = {
        jobId: 'job1'
      }
      result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
    })

    it('should not create the referral', async () => {
      expect(db)
        .to.have.deep.property('referrals')
        .to.have.lengthOf(1)
    })

    it('error with message', async () => {
      shouldRespondWithGqlError({
        path: [
          'person',
          'createReferral'
        ]
      })(result)
    })
  })

  describe('when job does not exists', () => {
    let db
    let result
    beforeEach(async () => {
      db = {
        people: [
          {
            id: 'person1'
          }
        ],
        jobs: [],
        referrals: []
      }
      const variables = {
        jobId: 'job1'
      }
      result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
    })

    it('should not create the referral', async () => {
      expect(db)
        .to.have.deep.property('referrals')
        .to.have.lengthOf(0)
    })

    it('error with message', async () => {
      shouldRespondWithGqlError({
        path: [
          'person',
          'createReferral'
        ]
      })(result)
    })
  })
})
