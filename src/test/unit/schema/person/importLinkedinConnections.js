/* eslint-env mocha */
const chai = require('chai')
const nock = require('nock')
const sinonChai = require('sinon-chai')
const sinon = require('sinon')
const find = require('lodash/find')

const DataSources = require('../../../../gql/schema/enums/data-sources')
const { resolvers } = require('../../../../gql/schema/person/importLinkedinConnections')
const mockClearbitRequests = require('../../helpers/clearbit/mock-requests')

const expect = chai.expect
const { importLinkedinConnections } = resolvers.Person

chai.use(sinonChai)

describe('Person.importLinkedinConnections', () => {
  before(() => {
    mockClearbitRequests()
  })

  after(() => {
    nock.cleanAll()
  })

  const importStub = sinon.stub()
  const queryStub = sinon.stub().returns([])
  const person = { id: 'person1' }
  const context = {
    store: {
      import: importStub,
      query: queryStub
    },
    noSQL: {
      readOne: () => ({}),
      create: () => ({})
    }
  }
  const args = {
    connections: [{
      'First Name': 'CONNECTION_FIRSTNAME1',
      'Last Name': 'CONNECTION_LASTNAME1',
      'Email Address': 'CONNECTION_EMAIL1',
      Position: 'CONNECTION_TITLE1',
      Company: 'CONNECTION_COMPANY1'
    }, {
      FirstName: 'CONNECTION_FIRSTNAME2',
      LastName: 'CONNECTION_LASTNAME2',
      EmailAddress: 'CONNECTION_EMAIL2',
      Position: 'CONNECTION_TITLE2',
      Company: 'CONNECTION_COMPANY2'
    }]
  }

  let resolverResult

  describe('when all data provided', () => {
    beforeEach(async () => {
      await importLinkedinConnections(person, args, context)
      resolverResult = importStub.firstCall.args[0]
    })

    afterEach(() => {
      importStub.reset()
      queryStub.reset()
    })

    it('should call store.import', () => {
      expect(importStub).to.have.been.called()
    })

    it('should format the data for importing', () => {
      expect(resolverResult.data).to.deep.equal([
        {
          data: [
            {
              company: '94d0a86fcf0307a7bf8014ffbacc6631',
              firstName: 'CONNECTION_FIRSTNAME1',
              from: 'person1',
              id: '7fbf424a62a8b817ef7558da45d51917',
              lastName: 'CONNECTION_LASTNAME1',
              person: '8836d22bd5f1ff063791931a9a84fd20',
              role: 'e272bf4933e474065626193c69e70bdc',
              source: 'LINKEDIN'
            },
            {
              company: '4bf9065b926e002fdb7e72196287d5eb',
              firstName: 'CONNECTION_FIRSTNAME2',
              from: 'person1',
              id: '1f7b1aac9196c0bf617f6f9a3b541160',
              lastName: 'CONNECTION_LASTNAME2',
              person: 'b54078deb464404a7156ad1e4aca79cf',
              role: '841a3e80cdd1f02eaa8ff3b092eddefa',
              source: 'LINKEDIN'
            }
          ],
          name: 'connections',
          onDuplicate: 'update'
        },
        {
          data: [
            {
              client: false,
              id: '94d0a86fcf0307a7bf8014ffbacc6631',
              name: 'CONNECTION_COMPANY1',
              onboarded: false,
              'slug': 'connection_company1'
            },
            {
              client: false,
              id: '4bf9065b926e002fdb7e72196287d5eb',
              name: 'CONNECTION_COMPANY2',
              onboarded: false,
              'slug': 'connection_company2'
            }
          ],
          name: 'companies'
        },
        {
          data: [
            {
              id: 'e272bf4933e474065626193c69e70bdc',
              name: 'CONNECTION_TITLE1'
            },
            {
              id: '841a3e80cdd1f02eaa8ff3b092eddefa',
              name: 'CONNECTION_TITLE2'
            }
          ],
          name: 'roles'
        },
        {
          data: [
            {
              email: 'CONNECTION_EMAIL1',
              id: '8836d22bd5f1ff063791931a9a84fd20'
            },
            {
              email: 'CONNECTION_EMAIL2',
              id: 'b54078deb464404a7156ad1e4aca79cf'
            }
          ],
          name: 'people'
        }
      ])
    })

    it('appends the source to the connections', () => {
      const connections = find(resolverResult.data, { name: 'connections' })
      expect(connections.data[0].source).to.equal(DataSources.values.LINKEDIN)
      expect(connections.data[1].source).to.equal(DataSources.values.LINKEDIN)
    })

    it('generates an ID for each connection', () => {
      const connections = find(resolverResult.data, { name: 'connections' })
      expect(connections.data[0].id).to.exist()
      expect(connections.data[0].id).to.be.a('string')
      expect(connections.data[1].id).to.exist()
      expect(connections.data[1].id).to.be.a('string')
    })

    it('generates relational company IDs', () => {
      const companies = find(resolverResult.data, { name: 'companies' })
      const connections = find(resolverResult.data, { name: 'connections' })
      const firstCompanyId = companies.data[0].id
      const secondCompanyId = companies.data[1].id
      expect(connections.data[0].company).to.equal(firstCompanyId)
      expect(connections.data[0].company).to.not.equal(secondCompanyId)
      expect(connections.data[1].company).to.equal(secondCompanyId)
      expect(connections.data[1].company).to.not.equal(firstCompanyId)
    })

    it('generates relational person IDs', () => {
      const people = find(resolverResult.data, { name: 'people' })
      const connections = find(resolverResult.data, { name: 'connections' })
      const firstPersonId = people.data[0].id
      const secondPersonId = people.data[1].id
      expect(connections.data[0].person).to.equal(firstPersonId)
      expect(connections.data[0].person).to.not.equal(secondPersonId)
      expect(connections.data[1].person).to.equal(secondPersonId)
      expect(connections.data[1].person).to.not.equal(firstPersonId)
    })

    it('generates relational person IDs', () => {
      const people = find(resolverResult.data, { name: 'people' })
      const connections = find(resolverResult.data, { name: 'connections' })
      const firstPersonId = people.data[0].id
      const secondPersonId = people.data[1].id
      expect(connections.data[0].person).to.equal(firstPersonId)
      expect(connections.data[0].person).to.not.equal(secondPersonId)
      expect(connections.data[1].person).to.equal(secondPersonId)
      expect(connections.data[1].person).to.not.equal(firstPersonId)
    })

    it('generates relational role IDs', () => {
      const roles = find(resolverResult.data, { name: 'roles' })
      const connections = find(resolverResult.data, { name: 'connections' })
      const firstRoleId = roles.data[0].id
      const secondRoleId = roles.data[1].id
      expect(connections.data[0].role).to.equal(firstRoleId)
      expect(connections.data[0].role).to.not.equal(secondRoleId)
      expect(connections.data[1].role).to.equal(secondRoleId)
      expect(connections.data[1].role).to.not.equal(firstRoleId)
    })
  })

  describe('when company is an empty string', () => {
    beforeEach(async () => {
      const args = {
        connections: [{
          FirstName: 'CONNECTION_FIRSTNAME1',
          LastName: 'CONNECTION_LASTNAME1',
          EmailAddress: 'CONNECTION_EMAIL1',
          Position: 'CONNECTION_TITLE1',
          Company: ''
        }]
      }
      await importLinkedinConnections(person, args, context)
      resolverResult = importStub.firstCall.args[0]
    })

    afterEach(() => {
      importStub.reset()
      queryStub.reset()
    })

    it('should not generate relational company ID', () => {
      const companies = find(resolverResult.data, { name: 'companies' })
      expect(companies.data).to.have.length(0)
    })

    it('should set null for company in the connection', () => {
      const connections = find(resolverResult.data, { name: 'connections' })
      expect(connections.data[0].company).to.be.null()
    })
  })

  describe('when position is an empty string', () => {
    beforeEach(async () => {
      const args = {
        connections: [{
          FirstName: 'CONNECTION_FIRSTNAME1',
          LastName: 'CONNECTION_LASTNAME1',
          EmailAddress: 'CONNECTION_EMAIL1',
          Position: '',
          Company: 'CONNECTION_COMPANY1'
        }]
      }
      await importLinkedinConnections(person, args, context)
      resolverResult = importStub.firstCall.args[0]
    })

    afterEach(() => {
      importStub.reset()
      queryStub.reset()
    })

    it('should not generate relational role ID', () => {
      const roles = find(resolverResult.data, { name: 'roles' })
      expect(roles.data).to.have.length(0)
    })

    it('should set null for role in the connection', () => {
      const connections = find(resolverResult.data, { name: 'connections' })
      expect(connections.data[0].role).to.be.null()
    })
  })

  describe('when email is an empty string', () => {
    beforeEach(async () => {
      const args = {
        connections: [{
          FirstName: 'CONNECTION_FIRSTNAME1',
          LastName: 'CONNECTION_LASTNAME1',
          EmailAddress: '',
          Position: 'CONNECTION_TITLE1',
          Company: 'CONNECTION_COMPANY1'
        }]
      }
      await importLinkedinConnections(person, args, context)
      resolverResult = importStub.firstCall.args[0]
    })

    afterEach(() => {
      importStub.reset()
      queryStub.reset()
    })

    it('should not create a connection', () => {
      const connections = find(resolverResult.data, { name: 'connections' })
      expect(connections.data).to.have.length(0)
    })
  })

  describe('when company slug already exists', () => {
    beforeEach(async () => {
      queryStub.returns([
        {
          slug: 'conflicting-slug',
          id: 'company1'
        }
      ])
      const args = {
        connections: [{
          'First Name': 'CONNECTION_FIRSTNAME1',
          'Last Name': 'CONNECTION_LASTNAME1',
          'Email Address': 'CONNECTION_EMAIL1',
          'Position': 'CONNECTION_TITLE1',
          'Company': 'Conflicting Slug'
        }]
      }
      await importLinkedinConnections(person, args, context)
      resolverResult = importStub.firstCall.args[0]
    })

    afterEach(() => {
      importStub.reset()
      queryStub.reset()
    })

    it('should create a unique company slug', () => {
      const { data: companyData } = find(resolverResult.data, { name: 'companies' })
      expect(companyData[0].slug).to.equal('conflicting-slug-HASH')
    })
  })
})
