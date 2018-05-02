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

describe('Query.referralBySlug', () => {
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
    await setupCollections(nosql, ['jobViewEvents', 'referralKeyToSlugMaps'])
  })

  afterEach(async () => {
    await sql(TABLES.REFERRALS).whereNot('id', '').del()
    await sql(TABLES.JOBS).whereNot('id', '').del()
    await sql(TABLES.COMPANIES).whereNot('id', '').del()
    await sql(TABLES.PEOPLE).whereNot('id', '').del()
    await truncateCollections(nosql)
  })

  after(async () => {
    await teardownCollections(nosql)
  })

  describe('for single valid connection', () => {
    let result
    let referralsSeed

    beforeEach(async () => {
      const [
        peopleSeed,
        companiesSeed
      ] = await seedSql([
        {
          name: TABLES.PEOPLE,
          data: [
            {
              email: 'email@domain.com'
            }
          ]
        },
        {
          name: TABLES.COMPANIES,
          data: [
            {
              name: 'Company',
              slug: 'company'
            }
          ]
        }
      ])
      const [ jobsSeed ] = await seedSql([
        {
          name: TABLES.JOBS,
          data: [
            {
              title: 'Job title',
              slug: 'job-title',
              bonus: '500',
              company: companiesSeed.ids[0]
            }
          ]
        }
      ]);
      [ referralsSeed ] = await seedSql([
        {
          name: TABLES.REFERRALS,
          data: [
            {
              slug: '1234567890',
              person: peopleSeed.ids[0],
              job: jobsSeed.ids[0]
            }
          ]
        }
      ])
      result = await runQuery(
        `
          query (
            $slug: String
          ) {
            referralBySlug (
              slug: $slug
            ) {
              id
              slug
            }
          }
        `,
        {
          slug: '1234567890'
        }
      )
    })

    it('should return referral', async () => {
      expect(result.data.referralBySlug).to.have.property('id', `${referralsSeed.ids[0]}`)
      expect(result.data.referralBySlug).to.have.property('slug', '1234567890')
    })
  })
})
