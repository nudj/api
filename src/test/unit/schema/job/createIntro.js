/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const {
  executeQueryOnDbUsingSchema
} = require('../../helpers')

describe('Job.createIntro', () => {
  const operation = `
    query testQuery (
      $job: ID!
      $candidate: PersonCreateInput!
      $notes: String
    ) {
      job (id: $job) {
        createIntro(
          candidate: $candidate,
          notes: $notes
        ) {
          id
          job {
            id
          }
          person {
            id
          }
          candidate {
            id
            email
            firstName
            lastName
          }
          notes
        }
      }
    }
  `

  describe('when candidate does not exist', () => {
    let db
    let result
    beforeEach(async () => {
      db = {
        people: [
          {
            id: 'person1',
            email: 'admin@company.com'
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
        intros: []
      }
      const variables = {
        job: 'job1',
        candidate: {
          email: 'candidate@company.com',
          firstName: 'CandidateFirst',
          lastName: 'CandidateLast'
        },
        notes: 'Here are some notes!'
      }
      result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
    })

    it('should create the candidate', async () => {
      expect(db)
        .to.have.deep.property('people.1')
        .to.deep.equal({
          id: 'person2',
          email: 'candidate@company.com',
          firstName: 'CandidateFirst',
          lastName: 'CandidateLast'
        })
    })

    it('should create the intro', async () => {
      expect(db)
        .to.have.deep.property('intros.0')
        .to.deep.equal({
          id: 'intro1',
          job: 'job1',
          person: 'person1',
          candidate: 'person2',
          notes: 'Here are some notes!'
        })
    })

    it('should return the intro', async () => {
      expect(result).to.deep.equal({
        data: {
          job: {
            createIntro: {
              id: 'intro1',
              job: {
                id: 'job1'
              },
              person: {
                id: 'person1'
              },
              candidate: {
                id: 'person2',
                email: 'candidate@company.com',
                firstName: 'CandidateFirst',
                lastName: 'CandidateLast'
              },
              notes: 'Here are some notes!'
            }
          }
        }
      })
    })
  })

  describe('when candidate does exist', () => {
    let db
    let result
    beforeEach(async () => {
      db = {
        people: [
          {
            id: 'person1',
            email: 'admin@company.com'
          },
          {
            id: 'person2',
            email: 'candidate@company.com',
            firstName: 'ExistingFirst',
            lastName: 'ExistingLast'
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
        intros: []
      }
      const variables = {
        job: 'job1',
        candidate: {
          email: 'candidate@company.com',
          firstName: 'CandidateFirst',
          lastName: 'CandidateLast'
        },
        notes: 'Here are some notes!'
      }
      result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
    })

    it('should not create the candidate', async () => {
      expect(db).to.not.have.deep.property('people.2')
    })

    it('should create the intro', async () => {
      expect(db)
        .to.have.deep.property('intros.0')
        .to.deep.equal({
          id: 'intro1',
          job: 'job1',
          person: 'person1',
          candidate: 'person2',
          notes: 'Here are some notes!'
        })
    })

    it('should return the intro', async () => {
      expect(result).to.deep.equal({
        data: {
          job: {
            createIntro: {
              id: 'intro1',
              job: {
                id: 'job1'
              },
              person: {
                id: 'person1'
              },
              candidate: {
                id: 'person2',
                email: 'candidate@company.com',
                firstName: 'ExistingFirst',
                lastName: 'ExistingLast'
              },
              notes: 'Here are some notes!'
            }
          }
        }
      })
    })
  })

  describe('when notes are not passed', () => {
    let db
    let result
    beforeEach(async () => {
      db = {
        people: [
          {
            id: 'person1',
            email: 'admin@company.com'
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
        intros: []
      }
      const variables = {
        job: 'job1',
        candidate: {
          email: 'candidate@company.com',
          firstName: 'CandidateFirst',
          lastName: 'CandidateLast'
        }
      }
      result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
    })

    it('should create the candidate', async () => {
      expect(db)
        .to.have.deep.property('people.1')
        .to.deep.equal({
          id: 'person2',
          email: 'candidate@company.com',
          firstName: 'CandidateFirst',
          lastName: 'CandidateLast'
        })
    })

    it('should create the intro with notes undefined', async () => {
      expect(db)
        .to.have.deep.property('intros.0')
        .to.deep.equal({
          id: 'intro1',
          job: 'job1',
          person: 'person1',
          candidate: 'person2',
          notes: undefined
        })
    })

    it('should return the intro will null for notes', async () => {
      expect(result).to.deep.equal({
        data: {
          job: {
            createIntro: {
              id: 'intro1',
              job: {
                id: 'job1'
              },
              person: {
                id: 'person1'
              },
              candidate: {
                id: 'person2',
                email: 'candidate@company.com',
                firstName: 'CandidateFirst',
                lastName: 'CandidateLast'
              },
              notes: null
            }
          }
        }
      })
    })
  })
})
