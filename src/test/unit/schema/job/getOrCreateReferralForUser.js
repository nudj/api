/* eslint-env mocha */
const chai = require('chai')
const nock = require('nock')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('Job.getOrCreateReferralForUser', () => {
  let IntercomMock
  const operation = `
    query testQuery (
      $personId: ID!
      $parentId: ID
    ) {
      job (id: "job1") {
        getOrCreateReferralForUser(
          person: $personId,
          parent: $parentId
        ) {
          id
        }
      }
    }
  `

  before(() => {
    IntercomMock = nock('https://api.intercom.io')
  })
  beforeEach(() => {
    IntercomMock.post('/events').reply(200, {})
    IntercomMock.post('/users').reply(200, {})
    IntercomMock.get('/contacts').reply(200, { contacts: [] })
  })
  afterEach(() => {
    nock.cleanAll()
  })

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
            id: 'job1',
            company: 'company1'
          }
        ],
        companies: [
          {
            id: 'company1'
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
          job: {
            getOrCreateReferralForUser: {
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
            company: 'company1'
          }
        ],
        companies: [
          {
            id: 'company1'
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
          job: {
            getOrCreateReferralForUser: {
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
            company: 'company1'
          }
        ],
        companies: [
          {
            id: 'company1'
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
          job: {
            getOrCreateReferralForUser: {
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
            company: 'company1'
          }
        ],
        companies: [
          {
            id: 'company1'
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
            getOrCreateReferralForUser: {
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
            id: 'job1',
            company: 'company1'
          }
        ],
        companies: [
          {
            id: 'company1'
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
          'getOrCreateReferralForUser'
        ]
      })(result)
    })
  })
})
