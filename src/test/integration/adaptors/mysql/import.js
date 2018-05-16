/* eslint-env mocha */
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const {
  sql,
  expect
} = require('../../lib')
const {
  TABLES,
  INDICES
} = require('../../../../lib/sql')

const { store: Store } = require('../../../../gql/adaptors/mysql')

describe('mysql: store.import', () => {
  let imp
  const table = TABLES.PEOPLE

  beforeEach(() => {
    const store = Store({ db: sql })
    imp = store.import
  })

  afterEach(async () => {
    await sql(table).whereNot('id', '').del()
  })

  it('should exist', () => {
    expect(imp).to.exist()
  })

  describe('when passing a single item', () => {
    let results

    beforeEach(async () => {
      results = await imp({
        type: table,
        data: [
          {
            email: 'bim@job.com'
          }
        ],
        index: INDICES[table].email
      })
    })

    it('should add new record in table', async () => {
      const [ record ] = await sql.select().from(table)
      expect(record).to.have.property('id').to.match(/^[0-9]+$/)
      expect(record).to.have.property('created')
      expect(record).to.have.property('modified')
      expect(record).to.have.property('email', 'bim@job.com')
    })

    it('should return the created record id', async () => {
      expect(results[0]).to.match(/^[0-9]+$/)
    })
  })

  describe('when passing a multiple items', () => {
    let results

    beforeEach(async () => {
      results = await imp({
        type: table,
        data: [
          {
            email: 'bim@job.com'
          },
          {
            email: 'bib@jom.com'
          }
        ],
        index: INDICES[table].email
      })
    })

    it('should add multiple new records in table', async () => {
      const records = await sql.select().from(table)

      expect(records).to.have.length(2)

      expect(records[0]).to.have.property('id').to.match(/^[0-9]+$/)
      expect(records[0]).to.have.property('created')
      expect(records[0]).to.have.property('modified')
      expect(records[0]).to.have.property('email', 'bim@job.com')

      expect(records[1]).to.have.property('id').to.match(/^[0-9]+$/)
      expect(records[1]).to.have.property('id').to.equal(records[0].id + 1)
      expect(records[1]).to.have.property('created')
      expect(records[1]).to.have.property('modified')
      expect(records[1]).to.have.property('email', 'bib@jom.com')
    })

    it('should return the created record ids', async () => {
      expect(results[0]).to.match(/^[0-9]+$/)
      expect(results[1]).to.match(/^[0-9]+$/)
      expect(results[1]).to.equal(results[0] + 1)
    })
  })

  describe('when record exists', () => {
    let id
    let results

    beforeEach(async () => {
      [ id ] = await sql(table).insert({
        email: 'bim@job.com'
      })
      results = await imp({
        type: table,
        data: [
          {
            email: 'bim@job.com'
          }
        ],
        index: INDICES[table].email
      })
    })

    it('should not add any new records', async () => {
      const records = await sql.select().from(table)
      expect(records).to.have.length(1)
    })

    it('should return the existing record id', async () => {
      expect(results[0]).to.equal(id)
    })
  })

  describe('when one record exists and another does not', () => {
    let id
    let results

    beforeEach(async () => {
      [ id ] = await sql(table).insert({
        email: 'bim@job.com'
      })
      results = await imp({
        type: table,
        data: [
          {
            email: 'bim@job.com'
          },
          {
            email: 'bib@jom.com'
          }
        ],
        index: INDICES[table].email
      })
    })

    it('should add one new record', async () => {
      const records = await sql.select().from(table)
      expect(records).to.have.length(2)

      expect(records[1]).to.have.property('id').to.match(/^[0-9]+$/)
      expect(records[1]).to.have.property('created')
      expect(records[1]).to.have.property('modified')
      expect(records[1]).to.have.property('email', 'bib@jom.com')
    })

    it('should return all the record ids', async () => {
      expect(results).to.deep.equal([ id, id + 1 ])
    })
  })

  describe('when some record exists and some do not', () => {
    let firstId
    let results

    beforeEach(async () => {
      [ firstId ] = await sql(table).insert({
        email: '2@2.com'
      })
      await sql(table).insert({
        email: '4@4.com'
      })
      await sql(table).insert({
        email: '6@6.com'
      })
      await sql(table).insert({
        email: '8@8.com'
      })
      results = await imp({
        type: table,
        data: [
          {
            email: '1@1.com'
          },
          {
            email: '2@2.com'
          },
          {
            email: '3@3.com'
          },
          {
            email: '4@4.com'
          },
          {
            email: '5@5.com'
          },
          {
            email: '6@6.com'
          },
          {
            email: '7@7.com'
          },
          {
            email: '8@8.com'
          },
          {
            email: '9@9.com'
          }
        ],
        index: INDICES[table].email
      })
    })

    it('should all the records', async () => {
      const records = await sql.select().from(table)
      expect(records).to.have.length(9)
    })

    it('should return all the record ids', async () => {
      expect(results).to.deep.equal([
        firstId + 4,
        firstId,
        firstId + 5,
        firstId + 1,
        firstId + 6,
        firstId + 2,
        firstId + 7,
        firstId + 3,
        firstId + 8
      ])
    })
  })
})
