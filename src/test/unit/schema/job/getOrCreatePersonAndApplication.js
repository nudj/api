/* eslint-env mocha */
const chai = require('chai')
const nock = require('nock')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Job.getOrCreatePersonAndApplication', () => {
  let IntercomMock
  const operation = `
    query testQuery (
      $person: PersonCreateInput!
      $referral: ID
    ) {
      job (id: "job1") {
        getOrCreatePersonAndApplication(
          person: $person,
          referral: $referral
        ) {
          id
          person {
            id
          }
          referral {
            id
          }
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

  describe('when person exists and application does not', () => {
    let db
    let result
    beforeEach(async () => {
      db = {
        people: [
          {
            id: 'person1',
            email: 'person@example.tld'
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
        applications: []
      }
      const variables = {
        person: {
          firstName: 'Example',
          lastName: 'Person',
          email: 'person@example.tld'
        }
      }
      result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
    })

    it('should create the application', async () => {
      expect(db)
        .to.have.deep.property('applications.0')
        .to.deep.equal({
          id: 'application1',
          job: 'job1',
          person: 'person1',
          referral: null
        })
    })

    it('should return the application', async () => {
      expect(result).to.deep.equal({
        data: {
          job: {
            getOrCreatePersonAndApplication: {
              id: 'application1',
              person: {
                id: 'person1'
              },
              referral: null
            }
          }
        }
      })
    })
  })

  describe('when referral id is provided', () => {
    let db
    let result
    beforeEach(async () => {
      db = {
        people: [
          {
            id: 'person1',
            email: 'person@example.tld'
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
            id: 'referral1'
          }
        ],
        applications: []
      }
      const variables = {
        person: {
          firstName: 'Example',
          lastName: 'Person',
          email: 'person@example.tld'
        },
        referral: 'referral1'
      }
      result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
    })

    it('should create the application', async () => {
      expect(db)
        .to.have.deep.property('applications.0')
        .to.deep.equal({
          id: 'application1',
          job: 'job1',
          person: 'person1',
          referral: 'referral1'
        })
    })

    it('should return the application', async () => {
      expect(result).to.deep.equal({
        data: {
          job: {
            getOrCreatePersonAndApplication: {
              id: 'application1',
              person: {
                id: 'person1'
              },
              referral: {
                id: 'referral1'
              }
            }
          }
        }
      })
    })
  })

  describe('when referral id is provided but does not exist', () => {
    let db
    let result
    beforeEach(async () => {
      db = {
        people: [
          {
            id: 'person1',
            email: 'person@example.tld'
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
        referrals: [],
        applications: []
      }
      const variables = {
        person: {
          firstName: 'Example',
          lastName: 'Person',
          email: 'person@example.tld'
        },
        referral: 'referral1'
      }
      result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
    })

    it('should create the application with null referral', async () => {
      expect(db)
        .to.have.deep.property('applications.0')
        .to.deep.equal({
          id: 'application1',
          job: 'job1',
          person: 'person1',
          referral: null
        })
    })

    it('should return the application with null referral', async () => {
      expect(result).to.deep.equal({
        data: {
          job: {
            getOrCreatePersonAndApplication: {
              id: 'application1',
              person: {
                id: 'person1'
              },
              referral: null
            }
          }
        }
      })
    })
  })

  describe('when application already exists', () => {
    let db
    let result
    beforeEach(async () => {
      db = {
        people: [
          {
            id: 'person1',
            email: 'person@example.tld'
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
        applications: [
          {
            id: 'application1',
            job: 'job1',
            person: 'person1'
          }
        ]
      }
      const variables = {
        person: {
          firstName: 'Example',
          lastName: 'Person',
          email: 'person@example.tld'
        }
      }
      result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
    })

    it('should not create the application', async () => {
      expect(db)
        .to.have.deep.property('applications')
        .to.have.lengthOf(1)
    })

    it('should return the existing application', async () => {
      expect(result).to.deep.equal({
        data: {
          job: {
            getOrCreatePersonAndApplication: {
              id: 'application1',
              person: {
                id: 'person1'
              },
              referral: null
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
        applications: []
      }
      const variables = {
        person: {
          firstName: 'Example',
          lastName: 'Person',
          email: 'person@example.tld'
        }
      }
      result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
    })

    it('should create the person and application', async () => {
      expect(result).to.deep.equal({
        data: {
          job: {
            getOrCreatePersonAndApplication: {
              id: 'application1',
              person: {
                id: 'person1'
              },
              referral: null
            }
          }
        }
      })
    })
  })
})
