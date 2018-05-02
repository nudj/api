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
  populateCollections,
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

describe('Query.referralByLegacyId', () => {
  let peopleSeed
  let companiesSeed
  let jobsSeed
  let referralsSeed

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

  beforeEach(async () => {
    [
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
    ]);
    [ jobsSeed ] = await seedSql([
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

  describe('when passing old arango id', () => {
    let result

    beforeEach(async () => {
      populateCollections(nosql, [
        {
          name: 'referralKeyToSlugMaps',
          data: [
            {
              _key: '30810601',
              slug: '1234567890'
            }
          ]
        }
      ])
      result = await runQuery(
        `
          query (
            $id: ID
          ) {
            referralByLegacyId (
              id: $id
            ) {
              id
              slug
            }
          }
        `,
        {
          id: '30810601'
        }
      )
    })

    it('should return referral from sql store', async () => {
      expect(result.data.referralByLegacyId).to.have.property('id', `${referralsSeed.ids[0]}`)
      expect(result.data.referralByLegacyId).to.have.property('slug', '1234567890')
    })
  })

  describe('when passing old MD5 id', () => {
    let result

    beforeEach(async () => {
      populateCollections(nosql, [
        {
          name: 'referralKeyToSlugMaps',
          data: [
            {
              _key: '745cbb4b67a4d37caadb09f438da7322',
              slug: '1234567890'
            }
          ]
        }
      ])
      result = await runQuery(
        `
          query (
            $id: ID
          ) {
            referralByLegacyId (
              id: $id
            ) {
              id
              slug
            }
          }
        `,
        {
          id: '745cbb4b67a4d37caadb09f438da7322'
        }
      )
    })

    it('should return referral from sql store', async () => {
      expect(result.data.referralByLegacyId).to.have.property('id', `${referralsSeed.ids[0]}`)
      expect(result.data.referralByLegacyId).to.have.property('slug', '1234567890')
    })
  })

  describe('when passing id that does not exist in the maps collection', () => {
    let result

    beforeEach(async () => {
      populateCollections(nosql, [
        {
          name: 'referralKeyToSlugMaps',
          data: [
            {
              _key: '745cbb4b67a4d37caadb09f438da7322',
              slug: '1234567890'
            }
          ]
        }
      ])
      result = await runQuery(
        `
          query (
            $id: ID
          ) {
            referralByLegacyId (
              id: $id
            ) {
              id
              slug
            }
          }
        `,
        {
          id: '123'
        }
      )
    })

    it('should return null', async () => {
      expect(result.data.referralByLegacyId).to.be.null()
    })
  })

  describe('when passing an undefined id', () => {
    let result

    beforeEach(async () => {
      populateCollections(nosql, [
        {
          name: 'referralKeyToSlugMaps',
          data: [
            {
              _key: '745cbb4b67a4d37caadb09f438da7322',
              slug: '1234567890'
            }
          ]
        }
      ])
      result = await runQuery(
        `
          query (
            $id: ID
          ) {
            referralByLegacyId (
              id: $id
            ) {
              id
              slug
            }
          }
        `,
        {
          id: undefined
        }
      )
    })

    it('should return null', async () => {
      expect(result.data.referralByLegacyId).to.be.null()
    })
  })
})
