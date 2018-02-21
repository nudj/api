/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('Job.createReferral', () => {
  const operation = `
    query testQuery (
      $personId: ID!
      $parentId: ID
    ) {
      job (id: "job1") {
        createReferral(
          person: $personId,
          parent: $parentId
        ) {
          id
        }
      }
    }
  `

  describe('when person exists and referral does not', () => {
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
            id: 'job1'
          }
        ],
        referrals: []
      }
      const variables = {
        personId: 'person1'
      }
      result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
    })

    it('should create the referral', async () => {
      expect(db)
        .to.have.deep.property('referrals.0')
        .to.deep.equal({
          id: 'referral1',
          job: 'job1',
          person: 'person1',
          parent: null
        })
    })

    it('should return the referral', async () => {
      expect(result).to.deep.equal({
        data: {
          job: {
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
            id: 'job1'
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
        personId: 'person1',
        parentId: 'referral1'
      }
      result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
    })

    it('should create the referral', async () => {
      expect(db)
        .to.have.deep.property('referrals.1')
        .to.deep.equal({
          id: 'referral2',
          job: 'job1',
          person: 'person1',
          parent: 'referral1'
        })
    })

    it('should return the referral', async () => {
      expect(result).to.deep.equal({
        data: {
          job: {
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
            id: 'job1'
          }
        ],
        referrals: []
      }
      const variables = {
        personId: 'person1',
        parentId: 'referral1'
      }
      result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
    })

    it('should create the referral with null parent', async () => {
      expect(db)
        .to.have.deep.property('referrals.0')
        .to.deep.equal({
          id: 'referral1',
          job: 'job1',
          person: 'person1',
          parent: null
        })
    })

    it('should return the referral with null parent', async () => {
      expect(result).to.deep.equal({
        data: {
          job: {
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
            id: 'job1'
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
        personId: 'person1'
      }
      result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
    })

    it('should not create the referral', async () => {
      expect(db)
        .to.have.deep.property('referrals')
        .to.have.lengthOf(1)
    })

    it('should return the existing referral', async () => {
      expect(result).to.deep.equal({
        data: {
          job: {
            createReferral: {
              id: 'referral1'
            }
          }
        }
      })
    })
  })

  describe('when person does not exists', () => {
    let db
    let result
    beforeEach(async () => {
      db = {
        people: [],
        jobs: [
          {
            id: 'job1'
          }
        ],
        referrals: []
      }
      const variables = {
        personId: 'person1'
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
          'job',
          'createReferral'
        ]
      })(result)
    })
  })
})
