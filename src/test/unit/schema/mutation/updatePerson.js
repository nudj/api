/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Mutation.updatePerson', () => {
  describe('when a company name is not specified', () => {
    it("should update the person's data", () => {
      const db = {
        people: [
          {
            id: 'person1',
            email: '',
            firstName: '',
            lastName: '',
            url: '',
            emailPreference: ''
          }
        ],
        companies: [],
        employments: []
      }

      const operation = `
        mutation SetEmailPreference ($emailPreference: EmailPreference) {
          updatePerson(
            id: "person1",
            data: {
              email: "test@test.tld",
              firstName: "Tester",
              lastName: "McTestFace",
              url: "lol.tld",
              emailPreference: $emailPreference
            }
          ) {
            id
            email
            firstName
            lastName
            url
            emailPreference
          }
        }
      `

      const variables = { emailPreference: 'GOOGLE' }

      return executeQueryOnDbUsingSchema({
        operation,
        variables,
        db,
        schema
      }).then(() => {
        return expect(db.people[0]).to.deep.equal({
          id: 'person1',
          email: 'test@test.tld',
          firstName: 'Tester',
          lastName: 'McTestFace',
          url: 'lol.tld',
          emailPreference: 'GOOGLE'
        })
      })
    })
  })

  describe('when a company name is specified', () => {
    describe('when the company exists', () => {
      const operation = `
        mutation SetEmailPreference ($emailPreference: EmailPreference) {
          updatePerson(
            id: "person1",
            data: {
              email: "test@test.tld",
              firstName: "Tester",
              lastName: "McTestFace",
              url: "lol.tld",
              company: "nudj",
              emailPreference: $emailPreference
            }
          ) {
            id
            email
            firstName
            lastName
            url
            emailPreference
          }
        }
      `

      const variables = { emailPreference: 'GOOGLE' }

      it('should update the person\'s data', () => {
        const db = {
          people: [
            {
              id: 'person1',
              email: '',
              firstName: '',
              lastName: '',
              url: '',
              emailPreference: ''
            }
          ],
          companies: [
            {
              id: 'company1',
              name: 'nudj'
            }
          ],
          employments: []
        }

        return executeQueryOnDbUsingSchema({
          operation,
          variables,
          db,
          schema
        }).then(() => {
          return expect(db.people[0]).to.deep.equal({
            id: 'person1',
            email: 'test@test.tld',
            firstName: 'Tester',
            lastName: 'McTestFace',
            url: 'lol.tld',
            emailPreference: 'GOOGLE'
          })
        })
      })

      it('should create an employment', () => {
        const db = {
          people: [
            {
              id: 'person1',
              email: '',
              firstName: '',
              lastName: '',
              url: '',
              company: 'nudj',
              emailPreference: ''
            }
          ],
          companies: [
            {
              id: 'company1',
              name: 'nudj'
            }
          ],
          employments: []
        }

        return executeQueryOnDbUsingSchema({
          operation,
          variables,
          db,
          schema
        }).then(() => {
          return expect(db.employments[0]).to.deep.equal({
            company: 'company1',
            current: true,
            id: 'employment1',
            person: 'person1',
            source: 'NUDJ'
          })
        })
      })

      it('should not create a company', () => {
        const db = {
          people: [
            {
              id: 'person1',
              email: '',
              firstName: '',
              lastName: '',
              url: '',
              company: 'nudj',
              emailPreference: ''
            }
          ],
          companies: [
            {
              id: 'company1',
              name: 'nudj'
            }
          ],
          employments: []
        }

        return executeQueryOnDbUsingSchema({
          operation,
          variables,
          db,
          schema
        }).then(() => {
          expect(db.companies.length).to.equal(1)
          return expect(db.companies[0]).to.deep.equal({
            id: 'company1',
            name: 'nudj'
          })
        })
      })
    })

    describe('when the company and employment exists', () => {
      const operation = `
        mutation SetEmailPreference ($emailPreference: EmailPreference) {
          updatePerson(
            id: "person1",
            data: {
              email: "test@test.tld",
              firstName: "Tester",
              lastName: "McTestFace",
              url: "lol.tld",
              company: "nudj",
              emailPreference: $emailPreference
            }
          ) {
            id
            email
            firstName
            lastName
            url
            emailPreference
          }
        }
      `

      const variables = { emailPreference: 'GOOGLE' }

      it('should update the person\'s data', () => {
        const db = {
          people: [
            {
              id: 'person1',
              email: '',
              firstName: '',
              lastName: '',
              url: '',
              emailPreference: ''
            }
          ],
          companies: [
            {
              id: 'company1',
              name: 'nudj'
            }
          ],
          employments: [
            {
              id: 'employment1',
              company: 'company1',
              person: 'person1',
              current: true
            }
          ]
        }

        return executeQueryOnDbUsingSchema({
          operation,
          variables,
          db,
          schema
        }).then(() => {
          return expect(db.people[0]).to.deep.equal({
            id: 'person1',
            email: 'test@test.tld',
            firstName: 'Tester',
            lastName: 'McTestFace',
            url: 'lol.tld',
            emailPreference: 'GOOGLE'
          })
        })
      })

      it('should not create an employment', () => {
        const db = {
          people: [
            {
              id: 'person1',
              email: '',
              firstName: '',
              lastName: '',
              url: '',
              company: 'nudj',
              emailPreference: ''
            }
          ],
          companies: [
            {
              id: 'company1',
              name: 'nudj'
            }
          ],
          employments: [
            {
              id: 'employment1',
              company: 'company1',
              person: 'person1',
              current: true
            }
          ]
        }

        return executeQueryOnDbUsingSchema({
          operation,
          variables,
          db,
          schema
        }).then(() => {
          expect(db.employments.length).to.equal(1)
          return expect(db.employments[0]).to.deep.equal({
            id: 'employment1',
            company: 'company1',
            person: 'person1',
            current: true
          })
        })
      })

      it('should not create a company', () => {
        const db = {
          people: [
            {
              id: 'person1',
              email: '',
              firstName: '',
              lastName: '',
              url: '',
              company: 'nudj',
              emailPreference: ''
            }
          ],
          companies: [
            {
              id: 'company1',
              name: 'nudj'
            }
          ],
          employments: [
            {
              id: 'employment1',
              company: 'company1',
              person: 'person1',
              current: true
            }
          ]
        }

        return executeQueryOnDbUsingSchema({
          operation,
          variables,
          db,
          schema
        }).then(() => {
          expect(db.companies.length).to.equal(1)
          return expect(db.companies[0]).to.deep.equal({
            id: 'company1',
            name: 'nudj'
          })
        })
      })
    })

    describe('when the company does not exist', () => {
      const operation = `
        mutation SetEmailPreference ($emailPreference: EmailPreference) {
          updatePerson(
            id: "person1",
            data: {
              email: "test@test.tld",
              firstName: "Tester",
              lastName: "McTestFace",
              url: "lol.tld",
              company: "nudj",
              emailPreference: $emailPreference
            }
          ) {
            id
            email
            firstName
            lastName
            url
            emailPreference
          }
        }
      `

      const variables = { emailPreference: 'GOOGLE' }

      it('should update the person\'s data', () => {
        const db = {
          people: [
            {
              id: 'person1',
              email: '',
              firstName: '',
              lastName: '',
              url: '',
              emailPreference: ''
            }
          ],
          companies: [],
          employments: []
        }

        return executeQueryOnDbUsingSchema({
          operation,
          variables,
          db,
          schema
        }).then(() => {
          return expect(db.people[0]).to.deep.equal({
            id: 'person1',
            email: 'test@test.tld',
            firstName: 'Tester',
            lastName: 'McTestFace',
            url: 'lol.tld',
            emailPreference: 'GOOGLE'
          })
        })
      })

      it('should create an employment', () => {
        const db = {
          people: [
            {
              id: 'person1',
              email: '',
              firstName: '',
              lastName: '',
              url: '',
              company: 'nudj',
              emailPreference: ''
            }
          ],
          companies: [],
          employments: []
        }

        return executeQueryOnDbUsingSchema({
          operation,
          variables,
          db,
          schema
        }).then(() => {
          return expect(db.employments[0]).to.deep.equal({
            company: 'company1',
            current: true,
            id: 'employment1',
            person: 'person1',
            source: 'NUDJ'
          })
        })
      })

      it('should create a company', () => {
        const db = {
          people: [
            {
              id: 'person1',
              email: '',
              firstName: '',
              lastName: '',
              url: '',
              company: 'nudj',
              emailPreference: ''
            }
          ],
          companies: [],
          employments: []
        }

        return executeQueryOnDbUsingSchema({
          operation,
          variables,
          db,
          schema
        }).then(() => {
          expect(db.companies.length).to.equal(1)
          return expect(db.companies[0]).to.deep.equal({
            id: 'company1',
            client: false,
            onboarded: false,
            slug: 'nudj',
            name: 'nudj'
          })
        })
      })
    })
  })
})
