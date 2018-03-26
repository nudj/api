/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

const operation = `
  mutation ($email: String!, $parentId: ID) {
    jobs {
      createReferralByEmail(email: $email, parent: $parentId) {
        id
      }
    }
  }
`

const variables = {
  email: 'bardo@lololololololol.com'
}

describe('Job.createReferralByEmail', () => {
  let db

  beforeEach(() => {
    db = {
      referrals: [
        {
          id: 'superReferralID'
        }
      ],
      people: [
        {
          id: 'person1',
          email: 'iseeyou@hahahahahahaha.com'
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
      ]
    }
  })

  it('should create the referral', async () => {
    await executeQueryOnDbUsingSchema({
      operation,
      variables,
      db,
      schema
    })

    expect(db.referrals[1]).to.deep.equal({
      id: 'referral2',
      job: 'job1',
      parent: null,
      person: 'person2'
    })
  })

  it('should create a person for a new email', async () => {
    await executeQueryOnDbUsingSchema({
      operation,
      variables,
      db,
      schema
    })

    expect(db.people.length).to.equal(2)
    expect(db.people[1]).to.deep.equal({
      id: 'person2',
      email: 'bardo@lololololololol.com'
    })
  })

  it('should not create a person for an existing email', async () => {
    await executeQueryOnDbUsingSchema({
      operation,
      variables: {
        email: 'iseeyou@hahahahahahaha.com'
      },
      db,
      schema
    })

    expect(db.people.length).to.equal(1)
    expect(db.people[0]).to.deep.equal({
      id: 'person1',
      email: 'iseeyou@hahahahahahaha.com'
    })
  })

  it('should add parent field if supplied', async () => {
    await executeQueryOnDbUsingSchema({
      operation,
      variables: {
        ...variables,
        parentId: 'superReferralID'
      },
      db,
      schema
    })

    expect(db.referrals[1]).to.deep.equal({
      id: 'referral2',
      job: 'job1',
      parent: 'superReferralID',
      person: 'person2'
    })
  })

  it('return the new referral', async () => {
    const result = await executeQueryOnDbUsingSchema({
      operation,
      variables,
      db,
      schema
    })
    expect(result)
    .to.have.deep.property('data.jobs[0].createReferralByEmail')
    .to.deep.equal({
      id: 'referral2'
    })
  })
})
