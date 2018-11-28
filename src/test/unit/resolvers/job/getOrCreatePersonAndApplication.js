/* eslint-env mocha */
const chai = require('chai')
const sinon = require('sinon')
const chaiAsPromised = require('chai-as-promised')
const proxyquire = require('proxyquire')
const clone = require('lodash/cloneDeep')
const { createTestContext } = require('../../helpers')

const fetchIntegrationHelperStub = sinon.stub()
const postCandidateStub = sinon.stub()

const {
  resolvers: {
    Job: { getOrCreatePersonAndApplication }
  }
} = proxyquire('../../../../gql/schema/job/getOrCreatePersonAndApplication', {
  '../../lib/fetch-integration-helper': fetchIntegrationHelperStub
})

chai.use(chaiAsPromised)

const { expect } = chai

const job = {
  id: 'job1',
  company: 'company1',
  title: 'Head Trumper'
}
const args = {
  person: { email: 'person1@email.tld' },
  referral: 'referral1'
}
const baseDb = {
  jobs: [job],
  companies: [{
    id: 'company1'
  }],
  people: [],
  referrals: [],
  applications: []
}

describe('Job.getOrCreatePersonAndApplication', () => {
  let db
  let context
  beforeEach(() => {
    db = clone(baseDb)
    context = createTestContext(db)
    fetchIntegrationHelperStub.returns({ postCandidate: postCandidateStub })
  })

  afterEach(() => {
    fetchIntegrationHelperStub.reset()
    postCandidateStub.reset()
  })

  it('it creates a new application', async () => {
    await getOrCreatePersonAndApplication(job, args, context)
    expect(db.applications.length).to.equal(1)
    expect(db.applications[0]).to.deep.equal({
      id: 'application1',
      job: 'job1',
      person: 'person1',
      referral: null
    })
  })

  it('it creates a new person', async () => {
    await getOrCreatePersonAndApplication(job, args, context)
    expect(db.people.length).to.equal(1)
    expect(db.people[0]).to.deep.equal({
      id: 'person1',
      email: 'person1@email.tld'
    })
  })

  it('returns the new application', async () => {
    const result = await getOrCreatePersonAndApplication(job, args, context)
    expect(result).to.deep.equal({
      id: 'application1',
      job: 'job1',
      person: 'person1',
      referral: null
    })
  })

  describe('when the referral exists', () => {
    let result
    beforeEach(async () => {
      db.referrals = [{
        id: 'referral1'
      }]
      const context = createTestContext(db)

      result = await getOrCreatePersonAndApplication(job, args, context)
    })

    it('it adds the existing referral id to the application', () => {
      expect(db.applications[0]).to.have.property('referral', 'referral1')
    })

    it('returns the new application with the referral id', () => {
      expect(result).to.have.property('referral', 'referral1')
    })
  })

  describe('when an application already exists', () => {
    let result
    beforeEach(async () => {
      db.applications = [{
        id: 'application1',
        job: 'job1',
        person: 'person1'
      }]
      const context = createTestContext(db)

      result = await getOrCreatePersonAndApplication(job, args, context)
    })

    it('it does not create a new application', () => {
      expect(db.applications.length).to.equal(1)
      expect(db.applications[0]).to.deep.equal({
        id: 'application1',
        job: 'job1',
        person: 'person1'
      })
    })

    it('returns the new application', () => {
      expect(result).to.deep.equal(db.applications[0])
    })
  })

  describe('when the person already exists', () => {
    beforeEach(async () => {
      db.people = [{
        id: 'person1',
        email: 'person1@email.tld'
      }]
      const context = createTestContext(db)

      await getOrCreatePersonAndApplication(job, args, context)
    })

    it('it does not create a new person', () => {
      expect(db.people.length).to.equal(1)
      expect(db.people[0]).to.deep.equal({
        id: 'person1',
        email: 'person1@email.tld'
      })
    })
  })

  describe('when the company has an integration', () => {
    let context
    beforeEach(async () => {
      db.companies = [{
        id: 'company1',
        ats: 'GREENHOUSE'
      }]
      db.companyIntegrations = [{
        id: 'companyIntegration1',
        company: 'company1'
      }]
      context = createTestContext(db)

      await getOrCreatePersonAndApplication(job, args, context)
    })

    it('fetches the integration helper', () => {
      expect(fetchIntegrationHelperStub).to.have.been.calledWith({
        id: 'companyIntegration1',
        company: 'company1'
      })
    })

    it('posts the candidate to the ats', () => {
      expect(postCandidateStub).to.have.been.calledWith({
        sql: context.sql,
        application: { id: 'application1', job: 'job1', person: 'person1', referral: null },
        company: { ats: 'GREENHOUSE', id: 'company1' },
        job: { company: 'company1', id: 'job1', title: 'Head Trumper' },
        person: { email: 'person1@email.tld', id: 'person1' },
        referral: null
      })
    })
  })
})
