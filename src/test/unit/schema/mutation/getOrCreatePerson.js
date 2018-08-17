/* eslint-env mocha */
const chai = require('chai')
const nock = require('nock')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const mockClearbitRequests = require('../../helpers/clearbit/mock-requests')

const operation = `
  mutation (
    $person: PersonCreateInput!
  ) {
    getOrCreatePerson(person: $person) {
      id
    }
  }
`

describe('Mutation.getOrCreatePerson', () => {
  let db

  before(() => {
    mockClearbitRequests()
  })

  after(() => {
    nock.cleanAll()
  })

  beforeEach(() => {
    db = {
      people: [],
      companies: [
        {
          id: 'company1',
          name: 'nudj'
        }
      ],
      roles: [
        {
          id: 'role1',
          name: 'Killer Dev'
        }
      ],
      employments: [],
      personRoles: []
    }
  })

  describe('when the person already exists', () => {
    beforeEach(() => {
      db = {
        people: [
          {
            id: 'person1',
            email: 'gavin@alwayswatching.com'
          }
        ],
        companies: [
          {
            id: 'company1',
            name: 'nudj'
          }
        ],
        roles: [
          {
            id: 'role1',
            name: 'Killer Dev'
          }
        ],
        employments: [],
        personRoles: []
      }
    })

    it('returns the person', async () => {
      const variables = {
        person: {
          firstName: 'Gavin',
          lastName: 'Izz Vatching Yu',
          email: 'gavin@alwayswatching.com',
          company: 'Orwell Inc.',
          role: 'Ghost',
          url: 'alwayswatching.com'
        }
      }
      const result = await executeQueryOnDbUsingSchema({
        operation,
        variables,
        db,
        schema
      })
      expect(result.data).to.deep.equal({
        getOrCreatePerson: {
          id: 'person1'
        }
      })
    })

    it('does not create a new person', async () => {
      const variables = {
        person: {
          firstName: 'Gavin',
          lastName: 'Izz Vatching Yu',
          email: 'gavin@alwayswatching.com',
          company: 'Orwell Inc.',
          role: 'Ghost',
          url: 'alwayswatching.com'
        }
      }
      await executeQueryOnDbUsingSchema({
        operation,
        variables,
        db,
        schema
      })
      expect(db.people.length).to.deep.equal(1)
      expect(db.people[0]).to.deep.equal({
        id: 'person1',
        email: 'gavin@alwayswatching.com'
      })
    })
  })

  describe('when the person does not exist', () => {
    describe('when the company and role exists', () => {
      const variables = {
        person: {
          firstName: 'Richie',
          lastName: 'Von Palmerson',
          email: 'palmtherich@test.com',
          company: 'nudj',
          role: 'Killer Dev',
          url: 'mysite.com'
        }
      }

      it('should create the person', async () => {
        await executeQueryOnDbUsingSchema({
          operation,
          variables,
          db,
          schema
        })
        expect(db.people[0]).to.deep.equal({
          id: 'person1',
          firstName: 'Richie',
          lastName: 'Von Palmerson',
          email: 'palmtherich@test.com',
          url: 'mysite.com'
        })
      })

      it('should create an employment', async () => {
        await executeQueryOnDbUsingSchema({
          operation,
          variables,
          db,
          schema
        })
        expect(db.employments[0]).to.deep.equal({
          id: 'employment1',
          company: 'company1',
          current: true,
          person: 'person1',
          source: 'NUDJ'
        })
      })

      it('should create a personRole', async () => {
        await executeQueryOnDbUsingSchema({
          operation,
          variables,
          db,
          schema
        })
        expect(db.personRoles[0]).to.deep.equal({
          id: 'personRole1',
          role: 'role1',
          current: true,
          person: 'person1',
          source: 'NUDJ'
        })
      })

      it('should not create a company', async () => {
        await executeQueryOnDbUsingSchema({
          operation,
          variables,
          db,
          schema
        })
        expect(db.companies.length).to.equal(1)
        expect(db.companies[0]).to.deep.equal({
          id: 'company1',
          name: 'nudj'
        })
      })

      it('should not create a role', async () => {
        await executeQueryOnDbUsingSchema({
          operation,
          variables,
          db,
          schema
        })
        expect(db.roles.length).to.equal(1)
        expect(db.roles[0]).to.deep.equal({
          id: 'role1',
          name: 'Killer Dev'
        })
      })

      it('return the new person', async () => {
        const result = await executeQueryOnDbUsingSchema({
          operation,
          variables,
          db,
          schema
        })
        expect(result)
          .to.have.deep.property('data.getOrCreatePerson')
          .to.deep.equal({
            id: 'person1'
          })
      })
    })

    describe('when the company and role do not exist', () => {
      const variables = {
        person: {
          firstName: 'Richie',
          lastName: 'Von Palmerson',
          email: 'palmtherich@test.com',
          company: 'El Nudjo Magnifico',
          role: 'King of All Londinium',
          url: 'mysite.com'
        }
      }

      it('should create the person', async () => {
        await executeQueryOnDbUsingSchema({
          operation,
          variables,
          db,
          schema
        })
        expect(db.people[0]).to.deep.equal({
          id: 'person1',
          firstName: 'Richie',
          lastName: 'Von Palmerson',
          email: 'palmtherich@test.com',
          url: 'mysite.com'
        })
      })

      it('should create an employment', async () => {
        await executeQueryOnDbUsingSchema({
          operation,
          variables,
          db,
          schema
        })
        expect(db.employments[0]).to.deep.equal({
          id: 'employment1',
          company: 'company2',
          current: true,
          person: 'person1',
          source: 'NUDJ'
        })
      })

      it('should create a personRole', async () => {
        await executeQueryOnDbUsingSchema({
          operation,
          variables,
          db,
          schema
        })
        expect(db.personRoles[0]).to.deep.equal({
          id: 'personRole1',
          role: 'role2',
          current: true,
          person: 'person1',
          source: 'NUDJ'
        })
      })

      it('should create a new company', async () => {
        await executeQueryOnDbUsingSchema({
          operation,
          variables,
          db,
          schema
        })
        expect(db.companies.length).to.equal(2)
        expect(db.companies[1]).to.have.property('id', 'company2')
        expect(db.companies[1]).to.have.property('name', 'El Nudjo Magnifico')
        expect(db.companies[1]).to.have.property('slug', 'el-nudjo-magnifico')
        expect(db.companies[1]).to.have.property('hash').to.match(/[a-z0-9]{128}/)
      })

      it('should create a new role', async () => {
        await executeQueryOnDbUsingSchema({
          operation,
          variables,
          db,
          schema
        })
        expect(db.roles.length).to.equal(2)
        expect(db.roles[1]).to.deep.equal({
          id: 'role2',
          name: 'King of All Londinium'
        })
      })

      it('return the new person', async () => {
        const result = await executeQueryOnDbUsingSchema({
          operation,
          variables,
          db,
          schema
        })
        expect(result)
          .to.have.deep.property('data.getOrCreatePerson')
          .to.deep.equal({
            id: 'person1'
          })
      })
    })
  })
})
