/* eslint-env mocha */
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const {
  sql,
  expect
} = require('../../lib')
const {
  TABLES
} = require('../../../../lib/sql')

const { store: Store } = require('../../../../gql/adaptors/mysql')

describe('mysql: store.readMany', () => {
  let readMany
  let ids = []
  const table = 'people'

  beforeEach(async () => {
    const store = Store({ db: sql })
    readMany = store.readMany
    ids = []
    ids = ids.concat(await sql(table).insert({
      email: 'bim@job.com',
      firstName: 'Bim',
      lastName: 'Job',
      url: 'https://bimjob.com/hi'
    }))
    ids = ids.concat(await sql(table).insert({
      email: 'bom@jib.com',
      firstName: 'Bom',
      lastName: 'Jib',
      url: 'https://bomjib.com/hi'
    }))
    await sql(table).insert({
      email: 'jom@bib.com',
      firstName: 'Jom',
      lastName: 'Bib',
      url: 'https://jombib.com/hi'
    })
  })

  afterEach(async () => {
    await sql(TABLES.PEOPLE).whereNot('id', '').del()
  })

  it('should exist', () => {
    expect(readMany).to.exist()
  })

  describe('when passing ids', () => {
    let result

    beforeEach(async () => {
      result = await readMany({
        type: table,
        ids
      })
    })

    it('should return array', async () => {
      expect(result).to.be.an('array')
    })

    it('should return the records', async () => {
      expect(result[0]).to.have.property('id', ids[0])
      expect(result[1]).to.have.property('id', ids[1])
    })

    it('should return all the fields', async () => {
      expect(result[0]).to.have.property('email', 'bim@job.com')
      expect(result[0]).to.have.property('firstName', 'Bim')
      expect(result[0]).to.have.property('lastName', 'Job')
      expect(result[0]).to.have.property('url', 'https://bimjob.com/hi')

      expect(result[1]).to.have.property('email', 'bom@jib.com')
      expect(result[1]).to.have.property('firstName', 'Bom')
      expect(result[1]).to.have.property('lastName', 'Jib')
      expect(result[1]).to.have.property('url', 'https://bomjib.com/hi')
    })
  })

  describe('when ids are not passed', () => {
    it('should return null', async () => {
      const result = await readMany({
        type: table
      })
      await expect(result).to.be.null()
    })
  })
})
