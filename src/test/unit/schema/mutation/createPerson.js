/* eslint-env mocha */
const chai = require('chai')
const nock = require('nock')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const mockClearbitRequests = require('../../helpers/clearbit/mock-requests')

const operation = `
  mutation (
    $input: PersonCreateInput!
  ) {
    createPerson(input: $input) {
      id
    }
  }
`

describe('Mutation.createPerson', () => {
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
      currentEmployments: [],
      personRoles: [],
      currentPersonRoles: []
    }
  })

  describe('when the company and role exists', () => {
    const variables = {
      input: {
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
        person: 'person1',
        source: 'NUDJ'
      })
    })

    it('should create a currentEmployment', async () => {
      await executeQueryOnDbUsingSchema({
        operation,
        variables,
        db,
        schema
      })
      expect(db.currentEmployments[0]).to.deep.equal({
        id: 'currentEmployment1',
        person: 'person1',
        employment: 'employment1'
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
        person: 'person1',
        source: 'NUDJ'
      })
    })

    it('should create a currentPersonRole', async () => {
      await executeQueryOnDbUsingSchema({
        operation,
        variables,
        db,
        schema
      })
      expect(db.currentPersonRoles[0]).to.deep.equal({
        id: 'currentPersonRole1',
        person: 'person1',
        personRole: 'personRole1'
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
        .to.have.deep.property('data.createPerson')
        .to.deep.equal({
          id: 'person1'
        })
    })
  })

  describe('when the company and role do not exist', () => {
    const variables = {
      input: {
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
        person: 'person1',
        source: 'NUDJ'
      })
    })

    it('should create a currentEmployment', async () => {
      await executeQueryOnDbUsingSchema({
        operation,
        variables,
        db,
        schema
      })
      expect(db.currentEmployments[0]).to.deep.equal({
        id: 'currentEmployment1',
        person: 'person1',
        employment: 'employment1'
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
        person: 'person1',
        source: 'NUDJ'
      })
    })

    it('should create a currentPersonRole', async () => {
      await executeQueryOnDbUsingSchema({
        operation,
        variables,
        db,
        schema
      })
      expect(db.currentPersonRoles[0]).to.deep.equal({
        id: 'currentPersonRole1',
        person: 'person1',
        personRole: 'personRole1'
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
      expect(db.companies[1]).to.deep.equal({
        id: 'company2',
        client: false,
        name: 'El Nudjo Magnifico',
        slug: 'el-nudjo-magnifico'
      })
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
        .to.have.deep.property('data.createPerson')
        .to.deep.equal({
          id: 'person1'
        })
    })
  })
})
