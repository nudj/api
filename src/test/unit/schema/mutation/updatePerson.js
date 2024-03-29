/* eslint-env mocha */
const chai = require('chai')
const nock = require('nock')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const mockClearbitRequests = require('../../helpers/clearbit/mock-requests')

describe('Mutation.updatePerson', () => {
  before(() => {
    mockClearbitRequests()
  })

  after(() => {
    nock.cleanAll()
  })

  describe('when a company name or role name is not specified', () => {
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
        employments: [],
        currentEmployments: []
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
          employments: [],
          currentEmployments: []
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
          employments: [],
          currentEmployments: []
        }

        return executeQueryOnDbUsingSchema({
          operation,
          variables,
          db,
          schema
        }).then(() => {
          return expect(db.employments[0]).to.deep.equal({
            company: 'company1',
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
          employments: [],
          currentEmployments: []
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
              person: 'person1'
            }
          ],
          currentEmployments: []
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
              person: 'person1'
            }
          ],
          currentEmployments: []
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
            person: 'person1'
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
              person: 'person1'
            }
          ],
          currentEmployments: []
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
          employments: [],
          currentEmployments: []
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
          employments: [],
          currentEmployments: []
        }

        return executeQueryOnDbUsingSchema({
          operation,
          variables,
          db,
          schema
        }).then(() => {
          return expect(db.employments[0]).to.deep.equal({
            company: 'company1',
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
          employments: [],
          currentEmployments: []
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
            slug: 'nudj',
            name: 'nudj'
          })
        })
      })
    })
  })

  describe('when a role name is specified', () => {
    describe('when the role exists', () => {
      const operation = `
        mutation SetEmailPreference ($emailPreference: EmailPreference) {
          updatePerson(
            id: "person1",
            data: {
              email: "test@test.tld",
              firstName: "Tester",
              lastName: "McTestFace",
              url: "lol.tld",
              role: "worker",
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
          roles: [
            {
              id: 'role1',
              name: 'worker'
            }
          ],
          personRoles: [],
          currentPersonRoles: [],
          employments: [],
          currentEmployments: []
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

      it('should create a personRole', () => {
        const db = {
          people: [
            {
              id: 'person1',
              email: '',
              firstName: '',
              lastName: '',
              url: '',
              role: 'worker',
              emailPreference: ''
            }
          ],
          companies: [],
          roles: [
            {
              id: 'role1',
              name: 'worker'
            }
          ],
          personRoles: [],
          currentPersonRoles: [],
          employments: [],
          currentEmployments: []
        }

        return executeQueryOnDbUsingSchema({
          operation,
          variables,
          db,
          schema
        }).then(() => {
          return expect(db.personRoles[0]).to.deep.equal({
            id: 'personRole1',
            role: 'role1',
            person: 'person1',
            source: 'NUDJ'
          })
        })
      })

      it('should not create a role', () => {
        const db = {
          people: [
            {
              id: 'person1',
              email: '',
              firstName: '',
              lastName: '',
              url: '',
              role: 'worker',
              emailPreference: ''
            }
          ],
          companies: [],
          roles: [
            {
              id: 'role1',
              name: 'worker'
            }
          ],
          personRoles: [],
          currentPersonRoles: [],
          employments: [],
          currentEmployments: []
        }

        return executeQueryOnDbUsingSchema({
          operation,
          variables,
          db,
          schema
        }).then(() => {
          expect(db.roles.length).to.equal(1)
          return expect(db.roles[0]).to.deep.equal({
            id: 'role1',
            name: 'worker'
          })
        })
      })
    })

    describe('when the role and personRole exists', () => {
      const operation = `
        mutation SetEmailPreference ($emailPreference: EmailPreference) {
          updatePerson(
            id: "person1",
            data: {
              email: "test@test.tld",
              firstName: "Tester",
              lastName: "McTestFace",
              url: "lol.tld",
              role: "worker",
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
          personRoles: [
            {
              id: 'personRole1',
              role: 'role1',
              person: 'person1'
            }
          ],
          currentPersonRoles: [],
          roles: [
            {
              id: 'role1',
              name: 'worker'
            }
          ],
          companies: [],
          employments: [],
          currentEmployments: []
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

      it('should not create a personRole', () => {
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
          personRoles: [
            {
              id: 'personRole1',
              role: 'role1',
              person: 'person1'
            }
          ],
          currentPersonRoles: [],
          roles: [
            {
              id: 'role1',
              name: 'worker'
            }
          ],
          companies: [],
          employments: [],
          currentEmployments: []
        }

        return executeQueryOnDbUsingSchema({
          operation,
          variables,
          db,
          schema
        }).then(() => {
          expect(db.personRoles.length).to.equal(1)
          return expect(db.personRoles[0]).to.deep.equal({
            id: 'personRole1',
            role: 'role1',
            person: 'person1'
          })
        })
      })

      it('should not create a role', () => {
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
          personRoles: [
            {
              id: 'personRole1',
              role: 'role1',
              person: 'person1'
            }
          ],
          currentPersonRoles: [],
          roles: [
            {
              id: 'role1',
              name: 'worker'
            }
          ],
          companies: [],
          employments: [],
          currentEmployments: []
        }

        return executeQueryOnDbUsingSchema({
          operation,
          variables,
          db,
          schema
        }).then(() => {
          expect(db.roles.length).to.equal(1)
          return expect(db.roles[0]).to.deep.equal({
            id: 'role1',
            name: 'worker'
          })
        })
      })
    })

    describe('when the role does not exist', () => {
      const operation = `
        mutation SetEmailPreference ($emailPreference: EmailPreference) {
          updatePerson(
            id: "person1",
            data: {
              email: "test@test.tld",
              firstName: "Tester",
              lastName: "McTestFace",
              url: "lol.tld",
              role: "worker",
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
          personRoles: [],
          currentPersonRoles: [],
          roles: [],
          companies: [],
          employments: [],
          currentEmployments: []
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

      it('should create a personRole', () => {
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
          personRoles: [],
          currentPersonRoles: [],
          roles: [],
          companies: [],
          employments: [],
          currentEmployments: []
        }

        return executeQueryOnDbUsingSchema({
          operation,
          variables,
          db,
          schema
        }).then(() => {
          return expect(db.personRoles[0]).to.deep.equal({
            id: 'personRole1',
            role: 'role1',
            person: 'person1',
            source: 'NUDJ'
          })
        })
      })

      it('should create a role', () => {
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
          personRoles: [],
          currentPersonRoles: [],
          roles: [],
          companies: [],
          employments: [],
          currentEmployments: []
        }

        return executeQueryOnDbUsingSchema({
          operation,
          variables,
          db,
          schema
        }).then(() => {
          expect(db.roles.length).to.equal(1)
          return expect(db.roles[0]).to.deep.equal({
            id: 'role1',
            name: 'worker'
          })
        })
      })
    })
  })
})
