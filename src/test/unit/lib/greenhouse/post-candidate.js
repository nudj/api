/* eslint-env mocha */
const chai = require('chai')
const sinon = require('sinon')
const clone = require('lodash/cloneDeep')
const { createTestContext } = require('../../helpers')
const greenhousePostCandidate = require('../../../../gql/lib/greenhouse/post-candidate')

const expect = chai.expect
const postStub = sinon.stub()

const baseDb = {
  atsJobs: [{
    id: 'atsJob1',
    externalId: 'gJob1',
    company: 'company1',
    jobId: 'job1'
  }],
  people: []
}

const person = {
  id: 'person1',
  email: 'person@email.tld',
  firstName: 'Ronald',
  lastName: 'Drumpf'
}
const job = {
  id: 'job1'
}
const application = {
  id: 'application1'
}

describe('Greenhouse post candidate', () => {
  let postCandidate
  let context
  let db
  beforeEach(() => {
    postStub.reset()
    db = clone(baseDb)
    context = createTestContext(db)
    postCandidate = greenhousePostCandidate({ partner: { post: postStub } })
  })

  it('calls the `candidates` endpoint on the Greenhouse `partner` api', async () => {
    await postCandidate({
      context,
      person,
      job,
      application
    })

    expect(postStub).to.have.been.calledWith('candidates')
  })

  it('formats the submitted data', async () => {
    await postCandidate({
      context,
      person,
      job,
      application
    })

    expect(postStub).to.have.been.calledWith('candidates', {
      emails: [{ email: 'person@email.tld', type: 'personal' }],
      external_id: 'application1',
      first_name: 'Ronald',
      job_id: 'gJob1',
      last_name: 'Drumpf',
      notes: 'Applied via nudj',
      prospect: false
    })
  })

  describe('when `person.url` exists', () => {
    it('adds the `website` field to the submitted data', async () => {
      const person = {
        id: 'person1',
        email: 'person@email.tld',
        firstName: 'Ronald',
        lastName: 'Drumpf',
        url: 'https://the-lads.com'
      }
      await postCandidate({
        context,
        person,
        job,
        application
      })

      expect(postStub).to.have.been.calledWith('candidates', {
        emails: [{ email: 'person@email.tld', type: 'personal' }],
        website: [{ type: 'personal', url: 'https://the-lads.com' }],
        external_id: 'application1',
        first_name: 'Ronald',
        job_id: 'gJob1',
        last_name: 'Drumpf',
        notes: 'Applied via nudj',
        prospect: false
      })
    })
  })

  describe('when notes are provided', () => {
    it('adds the `notes` field to the submitted data', async () => {
      const notes = 'I am a note, and I say: Huzzah!'
      await postCandidate({
        context,
        person,
        job,
        application,
        notes
      })

      expect(postStub).to.have.been.calledWith('candidates', {
        emails: [{ email: 'person@email.tld', type: 'personal' }],
        external_id: 'application1',
        first_name: 'Ronald',
        job_id: 'gJob1',
        last_name: 'Drumpf',
        notes: 'I am a note, and I say: Huzzah!',
        prospect: false
      })
    })
  })

  describe('when a referral is provided', () => {
    it('it adds the `referral` field to the submitted data', async () => {
      db.people = db.people.concat({
        id: 'the_referral_person',
        email: 'second_person@email.tld',
        firstName: 'Dave',
        lastName: 'The Second'
      })
      const referral = {
        id: 'referral1',
        person: 'the_referral_person'
      }
      await postCandidate({
        context,
        person,
        job,
        application,
        referral
      })

      expect(postStub).to.have.been.calledWith('candidates', {
        emails: [{ email: 'person@email.tld', type: 'personal' }],
        referral: { email: 'second_person@email.tld', first_name: 'Dave', last_name: 'The Second' },
        external_id: 'application1',
        first_name: 'Ronald',
        job_id: 'gJob1',
        last_name: 'Drumpf',
        notes: 'Applied via nudj',
        prospect: false
      })
    })
  })
})
