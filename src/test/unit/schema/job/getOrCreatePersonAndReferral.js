/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Job.getOrCreatePersonAndReferral', () => {
  const operation = `
    query testQuery (
      $person: PersonCreateInput!
      $parent: ID
    ) {
      job (id: "job1") {
        getOrCreatePersonAndReferral(
          person: $person,
          parent: $parent
        ) {
          id
          person {
            id
          }
          parent {
            id
          }
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
        referrals: []
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

    it('should create the referral', async () => {
      expect(db)
        .to.have.deep.property('referrals.0')
        .to.deep.equal({
          id: 'referral1',
          job: 'job1',
          person: 'person1'
        })
    })

    it('should return the referral', async () => {
      expect(result).to.deep.equal({
        data: {
          job: {
            getOrCreatePersonAndReferral: {
              id: 'referral1',
              person: {
                id: 'person1'
              },
              parent: null
            }
          }
        }
      })
    })
  })

  describe('when parent id is provided', () => {
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
        referrals: [
          {
            id: 'referral1'
          }
        ]
      }
      const variables = {
        person: {
          firstName: 'Example',
          lastName: 'Person',
          email: 'person@example.tld'
        },
        parent: 'referral1'
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
            getOrCreatePersonAndReferral: {
              id: 'referral2',
              person: {
                id: 'person1'
              },
              parent: {
                id: 'referral1'
              }
            }
          }
        }
      })
    })
  })

  describe('when parent id is provided but does not exist', () => {
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
        referrals: []
      }
      const variables = {
        person: {
          firstName: 'Example',
          lastName: 'Person',
          email: 'person@example.tld'
        },
        parent: 'referral1'
      }
      result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
    })

    it('should create the referral with null referral', async () => {
      expect(db)
        .to.have.deep.property('referrals.0')
        .to.deep.equal({
          id: 'referral1',
          job: 'job1',
          person: 'person1'
        })
    })

    it('should return the referral with null referral', async () => {
      expect(result).to.deep.equal({
        data: {
          job: {
            getOrCreatePersonAndReferral: {
              id: 'referral1',
              person: {
                id: 'person1'
              },
              parent: null
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
        referrals: [
          {
            id: 'referral1',
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

    it('should not create the referral', async () => {
      expect(db)
        .to.have.deep.property('referrals')
        .to.have.lengthOf(1)
    })

    it('should return the existing referral', async () => {
      expect(result).to.deep.equal({
        data: {
          job: {
            getOrCreatePersonAndReferral: {
              id: 'referral1',
              person: {
                id: 'person1'
              },
              parent: null
            }
          }
        }
      })
    })
  })

  describe('when person does not exist', () => {
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
        referrals: []
      }
      const variables = {
        person: {
          firstName: 'Example',
          lastName: 'Person',
          email: 'person@example.tld',
          acceptedTerms: true
        }
      }
      result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
    })

    it('should create the person', async () => {
      expect(db)
        .to.have.deep.property('people.0')
        .to.deep.equal({
          id: 'person1',
          firstName: 'Example',
          lastName: 'Person',
          email: 'person@example.tld',
          acceptedTerms: true
        })
    })

    it('should create the referral', async () => {
      expect(db)
        .to.have.deep.property('referrals.0')
        .to.deep.equal({
          id: 'referral1',
          job: 'job1',
          person: 'person1'
        })
    })

    it('should return the referral', async () => {
      expect(result).to.deep.equal({
        data: {
          job: {
            getOrCreatePersonAndReferral: {
              id: 'referral1',
              person: {
                id: 'person1'
              },
              parent: null
            }
          }
        }
      })
    })
  })
})
