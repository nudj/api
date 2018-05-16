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

describe('mysql: store.readOneOrCreate', () => {
  const table = 'people'
  let readOneOrCreate
  const data = {
    email: 'bim@job.com',
    firstName: 'Bim',
    lastName: 'Job',
    url: 'https://bimjob.com/hi'
  }

  beforeEach(async () => {
    const store = Store({ db: sql })
    readOneOrCreate = store.readOneOrCreate
  })

  afterEach(async () => {
    await sql(TABLES.PEOPLE).whereNot('id', '').del()
  })

  it('should exist', () => {
    expect(readOneOrCreate).to.exist()
  })

  describe('when record exists', () => {
    let id
    let result

    beforeEach(async () => {
      [ id ] = await sql(table).insert(data)
      result = await readOneOrCreate({
        type: table,
        filters: {
          email: 'bim@job.com'
        },
        data
      })
    })

    it('should return the record and pass filters', async () => {
      expect(result).to.have.property('id', id)
    })

    it('should return all the fields', async () => {
      expect(result).to.have.property('created')
      expect(result).to.have.property('modified')
      expect(result).to.have.property('email', 'bim@job.com')
      expect(result).to.have.property('firstName', 'Bim')
      expect(result).to.have.property('lastName', 'Job')
      expect(result).to.have.property('url', 'https://bimjob.com/hi')
    })
  })

  describe('when record exists and pass filter', () => {
    let id
    let result

    beforeEach(async () => {
      [ id ] = await sql(table).insert(data)
      result = await readOneOrCreate({
        type: table,
        filter: {
          email: 'bim@job.com'
        },
        data
      })
    })

    it('should return the record', async () => {
      expect(result).to.have.property('id', id)
    })

    it('should return all the fields', async () => {
      expect(result).to.have.property('created')
      expect(result).to.have.property('modified')
      expect(result).to.have.property('email', 'bim@job.com')
      expect(result).to.have.property('firstName', 'Bim')
      expect(result).to.have.property('lastName', 'Job')
      expect(result).to.have.property('url', 'https://bimjob.com/hi')
    })
  })

  describe('when record does not exist and pass filters', () => {
    let result
    beforeEach(async () => {
      result = await readOneOrCreate({
        type: table,
        filters: {
          email: 'bim@job.com'
        },
        data
      })
    })

    it('should add new record in table', async () => {
      const [ record ] = await sql.select().from(table)
      expect(record).to.have.property('id').to.match(/^[0-9]+$/)
      expect(record).to.have.property('created')
      expect(record).to.have.property('modified')
      expect(record).to.have.property('email', 'bim@job.com')
      expect(record).to.have.property('firstName', 'Bim')
      expect(record).to.have.property('lastName', 'Job')
      expect(record).to.have.property('url', 'https://bimjob.com/hi')
    })

    it('should return the created entity', async () => {
      expect(result).to.have.property('id').to.match(/^[0-9]+$/)
      expect(result).to.have.property('created')
      expect(result).to.have.property('modified')
      expect(result).to.have.property('email', 'bim@job.com')
      expect(result).to.have.property('firstName', 'Bim')
      expect(result).to.have.property('lastName', 'Job')
      expect(result).to.have.property('url', 'https://bimjob.com/hi')
    })
  })

  describe('when record does not exist and pass filter', () => {
    let result
    beforeEach(async () => {
      result = await readOneOrCreate({
        type: table,
        filter: {
          email: 'bim@job.com'
        },
        data
      })
    })

    it('should add new record in table', async () => {
      const [ record ] = await sql.select().from(table)
      expect(record).to.have.property('id').to.match(/^[0-9]+$/)
      expect(record).to.have.property('created')
      expect(record).to.have.property('modified')
      expect(record).to.have.property('email', 'bim@job.com')
      expect(record).to.have.property('firstName', 'Bim')
      expect(record).to.have.property('lastName', 'Job')
      expect(record).to.have.property('url', 'https://bimjob.com/hi')
    })

    it('should return the created entity', async () => {
      expect(result).to.have.property('id').to.match(/^[0-9]+$/)
      expect(result).to.have.property('created')
      expect(result).to.have.property('modified')
      expect(result).to.have.property('email', 'bim@job.com')
      expect(result).to.have.property('firstName', 'Bim')
      expect(result).to.have.property('lastName', 'Job')
      expect(result).to.have.property('url', 'https://bimjob.com/hi')
    })
  })
})
