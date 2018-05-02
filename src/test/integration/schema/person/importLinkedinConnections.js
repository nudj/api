/* eslint-env mocha */
const { graphql } = require('graphql')
const promiseSerial = require('promise-serial')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const times = require('lodash/times')

const {
  sql,
  nosql,
  setupCollections,
  truncateCollections,
  teardownCollections,
  expect
} = require('../../lib')
const {
  TABLES
} = require('../../../../lib/sql')

const schema = require('../../../../gql/schema')
const { store: mysqlAdaptor } = require('../../../../gql/adaptors/mysql')
const { store: arangoAdaptor } = require('../../../../gql/adaptors/arango')

chai.use(chaiAsPromised)

describe('Person.importLinkedinConnections', () => {
  async function seedSql (data) {
    return promiseSerial(data.map(table => async () => {
      const [ id ] = await sql(table.name).insert(table.data)
      return {
        ...table,
        ids: times(table.data.length, index => id + index)
      }
    }))
  }
  async function runQuery (query, variables = {}) {
    const sqlStore = mysqlAdaptor({ db: sql })
    const nosqlStore = arangoAdaptor({ db: nosql })
    const context = {
      sql: sqlStore,
      nosql: nosqlStore
    }
    const result = await graphql(schema, query, undefined, context, variables)
    return result
  }

  before(async () => {
    await setupCollections(nosql, ['jobViewEvents', 'referralKeyToSlugsMap'])
  })

  afterEach(async () => {
    await sql(TABLES.CONNECTIONS).whereNot('id', '').del()
    await sql(TABLES.COMPANIES).whereNot('id', '').del()
    await sql(TABLES.ROLES).whereNot('id', '').del()
    await sql(TABLES.PEOPLE).whereNot('id', '').del()
    await truncateCollections(nosql)
  })

  after(async () => {
    await teardownCollections(nosql)
  })

  describe('for single valid connection', () => {
    let result

    beforeEach(async () => {
      const [ peopleSeed ] = await seedSql([
        {
          name: TABLES.PEOPLE,
          data: [
            {
              email: 'jim@bob.com'
            }
          ]
        }
      ])
      result = await runQuery(
        `
          query (
            $personId: ID
            $connections: [Data!]!
          ) {
            person (
              id: $personId
            ) {
              importLinkedinConnections (
                connections: $connections
              ) {
                id
              }
            }
          }
        `,
        {
          personId: peopleSeed.ids[0],
          connections: [
            {
              EmailAddress: 'jom@bib.com',
              Position: 'Job title',
              Company: 'Amazing Company Ltd'
            }
          ]
        }
      )
    })

    it('should create a new person', async () => {
      const people = await sql.select().from(TABLES.PEOPLE).orderBy('email')
      expect(people).to.have.length(2)
      expect(people[1]).to.have.property('email', 'jom@bib.com')
    })

    it('should create a new role', async () => {
      const roles = await sql.select().from(TABLES.ROLES)
      expect(roles).to.have.length(1)
      expect(roles[0]).to.have.property('name', 'Job title')
    })

    it('should create a new company', async () => {
      const companies = await sql.select().from(TABLES.COMPANIES)
      expect(companies).to.have.length(1)
      expect(companies[0]).to.have.property('name', 'Amazing Company Ltd')
    })

    it('should create a new connection', async () => {
      const people = await sql.select().from(TABLES.PEOPLE).orderBy('email')
      const roles = await sql.select().from(TABLES.ROLES)
      const companies = await sql.select().from(TABLES.COMPANIES)
      const connections = await sql.select().from(TABLES.CONNECTIONS)
      expect(connections).to.have.length(1)
      expect(connections[0]).to.have.property('person', people[1].id)
      expect(connections[0]).to.have.property('role', roles[0].id)
      expect(connections[0]).to.have.property('company', companies[0].id)
    })

    it('should return connections', async () => {
      expect(result.data.person.importLinkedinConnections).to.have.length(1)
    })

    it('should return connection id', async () => {
      expect(result.data.person.importLinkedinConnections[0]).to.have.property('id').to.match(/^[0-9]+$/)
    })
  })

  describe('for multiple valid connections', () => {
    let result

    beforeEach(async () => {
      const [ peopleSeed ] = await seedSql([
        {
          name: TABLES.PEOPLE,
          data: [
            {
              email: 'email0@domain.com'
            }
          ]
        }
      ])
      result = await runQuery(
        `
          query (
            $personId: ID
            $connections: [Data!]!
          ) {
            person (
              id: $personId
            ) {
              importLinkedinConnections (
                connections: $connections
              ) {
                id
              }
            }
          }
        `,
        {
          personId: peopleSeed.ids[0],
          connections: [
            {
              EmailAddress: 'email1@domain.com',
              Position: 'Job title 1',
              Company: 'Company 1'
            },
            {
              EmailAddress: 'email2@domain.com',
              Position: 'Job title 2',
              Company: 'Company 2'
            },
            {
              EmailAddress: 'email3@domain.com',
              Position: 'Job title 3',
              Company: 'Company 3'
            }
          ]
        }
      )
    })

    it('should create three new people', async () => {
      const people = await sql.select().from(TABLES.PEOPLE).orderBy('email')
      expect(people).to.have.length(4)
      expect(people[1]).to.have.property('email', 'email1@domain.com')
      expect(people[2]).to.have.property('email', 'email2@domain.com')
      expect(people[3]).to.have.property('email', 'email3@domain.com')
    })

    it('should create three new roles', async () => {
      const roles = await sql.select().from(TABLES.ROLES)
      expect(roles).to.have.length(3)
      expect(roles[0]).to.have.property('name', 'Job title 1')
      expect(roles[1]).to.have.property('name', 'Job title 2')
      expect(roles[2]).to.have.property('name', 'Job title 3')
    })

    it('should create three new companies', async () => {
      const companies = await sql.select().from(TABLES.COMPANIES)
      expect(companies).to.have.length(3)
      expect(companies[0]).to.have.property('name', 'Company 1')
      expect(companies[1]).to.have.property('name', 'Company 2')
      expect(companies[2]).to.have.property('name', 'Company 3')
    })

    it('should create a new connection', async () => {
      const people = await sql.select().from(TABLES.PEOPLE).orderBy('email')
      const roles = await sql.select().from(TABLES.ROLES)
      const companies = await sql.select().from(TABLES.COMPANIES)
      const connections = await sql.select().from(TABLES.CONNECTIONS)
      expect(connections).to.have.length(3)

      expect(connections[0]).to.have.property('person', people[1].id)
      expect(connections[0]).to.have.property('role', roles[0].id)
      expect(connections[0]).to.have.property('company', companies[0].id)

      expect(connections[1]).to.have.property('person', people[2].id)
      expect(connections[1]).to.have.property('role', roles[1].id)
      expect(connections[1]).to.have.property('company', companies[1].id)

      expect(connections[2]).to.have.property('person', people[3].id)
      expect(connections[2]).to.have.property('role', roles[2].id)
      expect(connections[2]).to.have.property('company', companies[2].id)
    })

    it('should return connections', async () => {
      expect(result.data.person.importLinkedinConnections).to.have.length(3)
    })

    it('should return connection ids', async () => {
      const connections = await sql.select().from(TABLES.CONNECTIONS)
      expect(result.data.person.importLinkedinConnections[0]).to.have.property('id', `${connections[0].id}`)
      expect(result.data.person.importLinkedinConnections[1]).to.have.property('id', `${connections[1].id}`)
      expect(result.data.person.importLinkedinConnections[2]).to.have.property('id', `${connections[2].id}`)
    })
  })

  describe('when person exists', () => {
    let result

    beforeEach(async () => {
      const [ peopleSeed ] = await seedSql([
        {
          name: TABLES.PEOPLE,
          data: [
            {
              email: 'jim@bob.com'
            },
            {
              email: 'jom@bib.com'
            }
          ]
        }
      ])
      result = await runQuery(
        `
          query (
            $personId: ID
            $connections: [Data!]!
          ) {
            person (
              id: $personId
            ) {
              importLinkedinConnections (
                connections: $connections
              ) {
                id
              }
            }
          }
        `,
        {
          personId: peopleSeed.ids[0],
          connections: [
            {
              EmailAddress: 'jom@bib.com',
              Position: 'Job title',
              Company: 'Amazing Company Ltd'
            }
          ]
        }
      )
    })

    it('should not create a new person', async () => {
      const people = await sql.select().from(TABLES.PEOPLE).orderBy('email')
      expect(people).to.have.length(2)
    })

    it('should create a new role', async () => {
      const roles = await sql.select().from(TABLES.ROLES)
      expect(roles).to.have.length(1)
      expect(roles[0]).to.have.property('name', 'Job title')
    })

    it('should create a new company', async () => {
      const companies = await sql.select().from(TABLES.COMPANIES)
      expect(companies).to.have.length(1)
      expect(companies[0]).to.have.property('name', 'Amazing Company Ltd')
    })

    it('should create a new connection with existing person', async () => {
      const people = await sql.select().from(TABLES.PEOPLE).orderBy('email')
      const roles = await sql.select().from(TABLES.ROLES)
      const companies = await sql.select().from(TABLES.COMPANIES)
      const connections = await sql.select().from(TABLES.CONNECTIONS)
      expect(connections).to.have.length(1)
      expect(connections[0]).to.have.property('person', people[1].id)
      expect(connections[0]).to.have.property('role', roles[0].id)
      expect(connections[0]).to.have.property('company', companies[0].id)
    })

    it('should return connection', async () => {
      expect(result.data.person.importLinkedinConnections).to.have.length(1)
    })

    it('should return connection id', async () => {
      expect(result.data.person.importLinkedinConnections[0]).to.have.property('id').to.match(/^[0-9]+$/)
    })
  })

  describe('when role exists', () => {
    let result

    beforeEach(async () => {
      const [ peopleSeed ] = await seedSql([
        {
          name: TABLES.PEOPLE,
          data: [
            {
              email: 'jim@bob.com'
            }
          ]
        },
        {
          name: TABLES.ROLES,
          data: [
            {
              name: 'Job title'
            }
          ]
        }
      ])
      result = await runQuery(
        `
          query (
            $personId: ID
            $connections: [Data!]!
          ) {
            person (
              id: $personId
            ) {
              importLinkedinConnections (
                connections: $connections
              ) {
                id
              }
            }
          }
        `,
        {
          personId: peopleSeed.ids[0],
          connections: [
            {
              EmailAddress: 'jom@bib.com',
              Position: 'Job title',
              Company: 'Amazing Company Ltd'
            }
          ]
        }
      )
    })

    it('should create a new person', async () => {
      const people = await sql.select().from(TABLES.PEOPLE).orderBy('email')
      expect(people).to.have.length(2)
    })

    it('should not create a new role', async () => {
      const roles = await sql.select().from(TABLES.ROLES)
      expect(roles).to.have.length(1)
      expect(roles[0]).to.have.property('name', 'Job title')
    })

    it('should create a new company', async () => {
      const companies = await sql.select().from(TABLES.COMPANIES)
      expect(companies).to.have.length(1)
      expect(companies[0]).to.have.property('name', 'Amazing Company Ltd')
    })

    it('should create a new connection with existing role', async () => {
      const people = await sql.select().from(TABLES.PEOPLE).orderBy('email')
      const roles = await sql.select().from(TABLES.ROLES)
      const companies = await sql.select().from(TABLES.COMPANIES)
      const connections = await sql.select().from(TABLES.CONNECTIONS)
      expect(connections).to.have.length(1)
      expect(connections[0]).to.have.property('person', people[1].id)
      expect(connections[0]).to.have.property('role', roles[0].id)
      expect(connections[0]).to.have.property('company', companies[0].id)
    })

    it('should return connection', async () => {
      expect(result.data.person.importLinkedinConnections).to.have.length(1)
    })

    it('should return connection id', async () => {
      expect(result.data.person.importLinkedinConnections[0]).to.have.property('id').to.match(/^[0-9]+$/)
    })
  })

  describe('when company exists', () => {
    let result

    beforeEach(async () => {
      const [ peopleSeed ] = await seedSql([
        {
          name: TABLES.PEOPLE,
          data: [
            {
              email: 'jim@bob.com'
            }
          ]
        },
        {
          name: TABLES.COMPANIES,
          data: [
            {
              name: 'Amazing Company Ltd',
              slug: 'amazing-company-ltd'
            }
          ]
        }
      ])
      result = await runQuery(
        `
          query (
            $personId: ID
            $connections: [Data!]!
          ) {
            person (
              id: $personId
            ) {
              importLinkedinConnections (
                connections: $connections
              ) {
                id
              }
            }
          }
        `,
        {
          personId: peopleSeed.ids[0],
          connections: [
            {
              EmailAddress: 'jom@bib.com',
              Position: 'Job title',
              Company: 'Amazing Company Ltd'
            }
          ]
        }
      )
    })

    it('should create a new person', async () => {
      const people = await sql.select().from(TABLES.PEOPLE).orderBy('email')
      expect(people).to.have.length(2)
    })

    it('should create a new role', async () => {
      const roles = await sql.select().from(TABLES.ROLES)
      expect(roles).to.have.length(1)
      expect(roles[0]).to.have.property('name', 'Job title')
    })

    it('should not create a new company', async () => {
      const companies = await sql.select().from(TABLES.COMPANIES)
      expect(companies).to.have.length(1)
      expect(companies[0]).to.have.property('name', 'Amazing Company Ltd')
      expect(companies[0]).to.have.property('slug', 'amazing-company-ltd')
    })

    it('should create a new connection with existing company', async () => {
      const people = await sql.select().from(TABLES.PEOPLE).orderBy('email')
      const roles = await sql.select().from(TABLES.ROLES)
      const companies = await sql.select().from(TABLES.COMPANIES)
      const connections = await sql.select().from(TABLES.CONNECTIONS)
      expect(connections).to.have.length(1)
      expect(connections[0]).to.have.property('person', people[1].id)
      expect(connections[0]).to.have.property('role', roles[0].id)
      expect(connections[0]).to.have.property('company', companies[0].id)
    })

    it('should return connection', async () => {
      expect(result.data.person.importLinkedinConnections).to.have.length(1)
    })

    it('should return connection id', async () => {
      expect(result.data.person.importLinkedinConnections[0]).to.have.property('id').to.match(/^[0-9]+$/)
    })
  })

  describe('when connection exists', () => {
    let result
    let connectionSeed

    beforeEach(async () => {
      const [
        peopleSeed,
        roleSeed,
        companySeed
      ] = await seedSql([
        {
          name: TABLES.PEOPLE,
          data: [
            {
              email: 'jim@bob.com'
            },
            {
              email: 'jom@bib.com'
            }
          ]
        },
        {
          name: TABLES.ROLES,
          data: [
            {
              name: 'Job title'
            }
          ]
        },
        {
          name: TABLES.COMPANIES,
          data: [
            {
              name: 'Amazing Company Ltd',
              slug: 'amazing-company-ltd'
            }
          ]
        }
      ]);
      [ connectionSeed ] = await seedSql([
        {
          name: TABLES.CONNECTIONS,
          data: [
            {
              from: peopleSeed.ids[0],
              person: peopleSeed.ids[1],
              role: roleSeed.ids[0],
              company: companySeed.ids[0],
              firstName: 'Jom',
              lastName: 'Bib'
            }
          ]
        }
      ])
      result = await runQuery(
        `
          query (
            $personId: ID
            $connections: [Data!]!
          ) {
            person (
              id: $personId
            ) {
              importLinkedinConnections (
                connections: $connections
              ) {
                id
              }
            }
          }
        `,
        {
          personId: peopleSeed.ids[0],
          connections: [
            {
              EmailAddress: 'jom@bib.com',
              Position: 'Job title',
              Company: 'Amazing Company Ltd'
            }
          ]
        }
      )
    })

    it('should not create a new person', async () => {
      const people = await sql.select().from(TABLES.PEOPLE).orderBy('email')
      expect(people).to.have.length(2)
    })

    it('should not create a new role', async () => {
      const roles = await sql.select().from(TABLES.ROLES)
      expect(roles).to.have.length(1)
      expect(roles[0]).to.have.property('name', 'Job title')
    })

    it('should not create a new company', async () => {
      const companies = await sql.select().from(TABLES.COMPANIES)
      expect(companies).to.have.length(1)
      expect(companies[0]).to.have.property('name', 'Amazing Company Ltd')
    })

    it('should not create a new connection', async () => {
      const people = await sql.select().from(TABLES.PEOPLE).orderBy('email')
      const roles = await sql.select().from(TABLES.ROLES)
      const companies = await sql.select().from(TABLES.COMPANIES)
      const connections = await sql.select().from(TABLES.CONNECTIONS)
      expect(connections).to.have.length(1)
      expect(connections[0]).to.have.property('person', people[1].id)
      expect(connections[0]).to.have.property('role', roles[0].id)
      expect(connections[0]).to.have.property('company', companies[0].id)
    })

    it('should return connection', async () => {
      expect(result.data.person.importLinkedinConnections).to.have.length(1)
    })

    it('should return connection id', async () => {
      expect(result.data.person.importLinkedinConnections[0]).to.have.property('id', `${connectionSeed.ids[0]}`)
    })
  })

  describe('when company slug clashes', () => {
    let result

    beforeEach(async () => {
      const [ peopleSeed ] = await seedSql([
        {
          name: TABLES.PEOPLE,
          data: [
            {
              email: 'jim@bob.com'
            }
          ]
        },
        {
          name: TABLES.COMPANIES,
          data: [
            {
              name: 'amazing company ltd',
              slug: 'amazing-company-ltd'
            }
          ]
        }
      ])
      result = await runQuery(
        `
          query (
            $personId: ID
            $connections: [Data!]!
          ) {
            person (
              id: $personId
            ) {
              importLinkedinConnections (
                connections: $connections
              ) {
                id
              }
            }
          }
        `,
        {
          personId: peopleSeed.ids[0],
          connections: [
            {
              EmailAddress: 'jom@bib.com',
              Position: 'Job title',
              Company: 'Amazing Company Ltd'
            }
          ]
        }
      )
    })

    it('should create a new person', async () => {
      const people = await sql.select().from(TABLES.PEOPLE).orderBy('email')
      expect(people).to.have.length(2)
    })

    it('should create a new role', async () => {
      const roles = await sql.select().from(TABLES.ROLES)
      expect(roles).to.have.length(1)
      expect(roles[0]).to.have.property('name', 'Job title')
    })

    it('should create a new company', async () => {
      const companies = await sql.select().from(TABLES.COMPANIES)
      expect(companies).to.have.length(2)
      expect(companies[0]).to.have.property('name', 'amazing company ltd')
      expect(companies[1]).to.have.property('name', 'Amazing Company Ltd')
    })

    it('should create a new non-clashing slug for the new company', async () => {
      const companies = await sql.select().from(TABLES.COMPANIES)
      expect(companies).to.have.length(2)
      expect(companies[1]).to.have.property('slug').to.match(/^amazing-company-ltd-[a-z0-9]{8}$/)
    })

    it('should create a new connection', async () => {
      const people = await sql.select().from(TABLES.PEOPLE).orderBy('email')
      const roles = await sql.select().from(TABLES.ROLES)
      const companies = await sql.select().from(TABLES.COMPANIES)
      const connections = await sql.select().from(TABLES.CONNECTIONS)
      expect(connections).to.have.length(1)
      expect(connections[0]).to.have.property('person', people[1].id)
      expect(connections[0]).to.have.property('role', roles[0].id)
      expect(connections[0]).to.have.property('company', companies[1].id)
    })

    it('should return connection', async () => {
      expect(result.data.person.importLinkedinConnections).to.have.length(1)
    })

    it('should return connection id', async () => {
      expect(result.data.person.importLinkedinConnections[0]).to.have.property('id').to.match(/^[0-9]+$/)
    })
  })
})
