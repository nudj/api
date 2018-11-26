/* eslint-env mocha */
const chai = require('chai')
const sinon = require('sinon')
const find = require('lodash/find')
const chaiAsPromised = require('chai-as-promised')
const proxyquire = require('proxyquire')
const clone = require('lodash/cloneDeep')
const { createTestContext } = require('../../helpers')
const { values: hirerTypes } = require('../../../../gql/schema/enums/hirer-types')

const mailerStub = sinon.stub()
const postCandidateStub = sinon.stub()
const fetchIntegrationHelperStub = sinon.stub()

const {
  resolvers: {
    Job: { createIntro }
  }
} = proxyquire('../../../../gql/schema/job/createIntro', {
  '../../lib/fetch-integration-helper': fetchIntegrationHelperStub,
  '../../lib/mailer': {
    sendNewIntroEmail: mailerStub
  }
})

chai.use(chaiAsPromised)

const { expect } = chai

const job = {
  id: 'job1',
  company: 'company1',
  title: 'Head Trumper'
}
const args = {
  consent: true,
  candidate: { email: 'candidate@email.tld', firstName: 'Can', lastName: 'Dî Date' },
  notes: 'I referred this person because they are okay I guess.'
}
const baseDb = {
  jobs: [job],
  companies: [{
    id: 'company1'
  }],
  people: [
    { id: 'person1' },
    { id: 'person2', email: 'adminA@email.tld' },
    { id: 'person3', email: 'adminB@email.tld' },
    { id: 'person4', email: 'adminC@email.tld' }
  ],
  hirers: [
    { id: 'hirer1', company: 'company1', person: 'person2', type: hirerTypes.ADMIN },
    { id: 'hirer2', company: 'company1', person: 'person3', type: hirerTypes.ADMIN },
    { id: 'hirer3', company: 'company1', person: 'person4', type: hirerTypes.MEMBER }
  ],
  referrals: [],
  intros: [],
  companyIntegrations: []
}

describe('Job.createIntro', () => {
  let db
  let context
  beforeEach(() => {
    db = clone(baseDb)
    context = createTestContext(db)
  })

  afterEach(() => {
    mailerStub.reset()
    postCandidateStub.reset()
    fetchIntegrationHelperStub.reset()
  })

  it('creates the candidate', async () => {
    await createIntro(job, args, context)

    const candidate = find(db.people, { id: 'person5' })
    expect(db.people.length).to.equal(5)
    expect(candidate).to.deep.equal({
      id: 'person5',
      email: 'candidate@email.tld',
      firstName: 'Can',
      lastName: 'Dî Date'
    })
  })

  it('creates the intro', async () => {
    await createIntro(job, args, context)

    expect(db.intros.length).to.equal(1)
    expect(db.intros[0]).to.deep.equal({
      id: 'intro1',
      candidate: 'person5',
      job: 'job1',
      notes: 'I referred this person because they are okay I guess.',
      person: 'person1',
      consent: true
    })
  })

  it('returns the intro', async () => {
    const result = await createIntro(job, args, context)

    expect(result).to.deep.equal(db.intros[0])
  })

  it('sends a notification email to all company admins', async () => {
    await createIntro(job, args, context)

    const emailedAdmins = mailerStub.args.map(call => call[0].to)
    expect(emailedAdmins).to.deep.equal(['adminA@email.tld', 'adminB@email.tld'])
  })

  describe('when the candidate already exists', () => {
    it('does not create the candidate', async () => {
      db.people = db.people.concat({
        id: 'specialCandyDate',
        email: 'candidate@email.tld',
        firstName: 'Can',
        lastName: 'Dî Date'
      })
      const { candidate } = await createIntro(job, args, context)
      expect(candidate).to.equal('specialCandyDate')
    })
  })

  describe('when the company has an ats', () => {
    beforeEach(() => {
      db.companies = [{
        id: 'company1',
        ats: 'GREENHOUSE'
      }]
      db.companyIntegrations = [{
        id: 'companyIntegration1',
        company: 'company1'
      }]
      fetchIntegrationHelperStub.returns({ postCandidate: postCandidateStub })
    })

    it('fetches the integration helper', async () => {
      await createIntro(job, args, context)

      expect(fetchIntegrationHelperStub).to.have.been.calledWith({
        id: 'companyIntegration1',
        company: 'company1'
      })
    })

    it('posts the candidate to the ats', async () => {
      await createIntro(job, args, context)

      expect(postCandidateStub).to.have.been.calledWith({
        store: context.store,
        application: {
          consent: true,
          candidate: 'person5',
          person: 'person1',
          id: 'intro1',
          job: 'job1',
          notes: 'I referred this person because they are okay I guess.'
        },
        job: { company: 'company1', id: 'job1', title: 'Head Trumper' },
        notes: 'I referred this person because they are okay I guess.',
        company: { ats: 'GREENHOUSE', id: 'company1' },
        person: { id: 'person1' }
      })
    })
  })
})
