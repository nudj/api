/* eslint-env mocha */
const chai = require('chai')
const nock = require('nock')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('Job.createReferralWithParentForPerson', () => {
  let IntercomMock
  const operation = `
    query testQuery (
      $personId: ID!
      $parentPersonId: ID!
    ) {
      job (id: "job1") {
        createReferralWithParentForPerson(
          person: $personId,
          parentPerson: $parentPersonId
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

  describe('when a parent referral does not exist', () => {
    let db
    let result
    beforeEach(async () => {
      db = {
        people: [
          {
            id: 'person1'
          },
          {
            id: 'parentPerson1'
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
        parentPersonId: 'parentPerson1'
      }
      result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
    })

    it('should create a parent referral', async () => {
      expect(db).to.have.deep.property('referrals.0')
      expect(db.referrals[0]).to.have.deep.property('id', 'referral1')
      expect(db.referrals[0]).to.have.deep.property('job', 'job1')
      expect(db.referrals[0]).to.have.deep.property('person', 'parentPerson1')
      expect(db.referrals[0]).to.have.deep.property('slug').to.match(/[a-z0-9]{10}/)
    })

    it('should create the referral', async () => {
      expect(db).to.have.deep.property('referrals.1')
      expect(db.referrals[1]).to.have.deep.property('id', 'referral2')
      expect(db.referrals[1]).to.have.deep.property('job', 'job1')
      expect(db.referrals[1]).to.have.deep.property('person', 'person1')
      expect(db.referrals[1]).to.have.deep.property('parent', 'referral1')
      expect(db.referrals[1]).to.have.deep.property('slug').to.match(/[a-z0-9]{10}/)
    })

    it('should return the referral', async () => {
      expect(result).to.deep.equal({
        data: {
          job: {
            createReferralWithParentForPerson: {
              id: 'referral2'
            }
          }
        }
      })
    })
  })

  describe('when a parent referral does exist', () => {
    let db
    let result
    beforeEach(async () => {
      db = {
        people: [
          {
            id: 'person1'
          },
          {
            id: 'parentPerson1'
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
            person: 'parentPerson1'
          }
        ]
      }
      const variables = {
        personId: 'person1',
        parentPersonId: 'parentPerson1'
      }
      result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
    })

    it('should not create a parent referral', async () => {
      expect(db)
        .to.have.deep.property('referrals')
        .to.have.lengthOf(2)
    })

    it('should create the referral with existing parent', async () => {
      expect(db).to.have.deep.property('referrals.1')
      expect(db.referrals[1]).to.have.deep.property('id', 'referral2')
      expect(db.referrals[1]).to.have.deep.property('job', 'job1')
      expect(db.referrals[1]).to.have.deep.property('person', 'person1')
      expect(db.referrals[1]).to.have.deep.property('parent', 'referral1')
      expect(db.referrals[1]).to.have.deep.property('slug').to.match(/[a-z0-9]{10}/)
    })

    it('should return the referral', async () => {
      expect(result).to.deep.equal({
        data: {
          job: {
            createReferralWithParentForPerson: {
              id: 'referral2'
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
          },
          {
            id: 'parentPerson1'
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
        personId: 'person1',
        parentPersonId: 'parentPerson1'
      }
      result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
    })

    it('should not create a parent referral', async () => {
      expect(db)
        .to.have.deep.property('referrals')
        .to.have.lengthOf(1)
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
            createReferralWithParentForPerson: {
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
        people: [
          {
            id: 'parentPerson1'
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
        parentPersonId: 'parentPerson1'
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
          'createReferralWithParentForPerson'
        ]
      })(result)
    })
  })

  describe('when parentPerson does not exists', () => {
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
        personId: 'person1',
        parentPersonId: 'parentPerson1'
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
          'createReferralWithParentForPerson'
        ]
      })(result)
    })
  })
})
