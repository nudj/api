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

describe('mysql: store.readOne', () => {
  let readOne
  let id
  const table = 'people'

  beforeEach(async () => {
    const store = Store({ db: sql })
    readOne = store.readOne
  })

  afterEach(async () => {
    await sql(TABLES.PEOPLE).whereNot('id', '').del()
  })

  it('should exist', () => {
    expect(readOne).to.exist()
  })

  describe('when reading by id', () => {
    let result

    beforeEach(async () => {
      [ id ] = await sql(table).insert({
        email: 'bim@job.com',
        firstName: 'Bim',
        lastName: 'Job',
        url: 'https://bimjob.com/hi'
      })
      result = await readOne({
        type: table,
        id
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

  describe('when reading by filters', () => {
    let result

    beforeEach(async () => {
      [ id ] = await sql(table).insert({
        email: 'bim@job.com',
        firstName: 'Bim',
        lastName: 'Job',
        url: 'https://bimjob.com/hi'
      })
      result = await readOne({
        type: table,
        filters: {
          firstName: 'Bim'
        }
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

  describe('when reading by filter', () => {
    let result

    beforeEach(async () => {
      [ id ] = await sql(table).insert({
        email: 'bim@job.com',
        firstName: 'Bim',
        lastName: 'Job',
        url: 'https://bimjob.com/hi'
      })
      result = await readOne({
        type: table,
        filter: {
          firstName: 'Bim'
        }
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

  describe('when id or filters|filter are not passed', () => {
    it('should return null', async () => {
      const result = await readOne({
        type: table
      })
      expect(result).to.be.null()
    })
  })

  describe('when record does not exist', () => {
    describe('when reading by id', () => {
      it('should return null', async () => {
        const result = await readOne({
          type: table,
          id: 1
        })
        expect(result).to.be.null()
      })
    })

    describe('when reading by filters', () => {
      it('should return null', async () => {
        const result = await readOne({
          type: table,
          filters: {
            firstName: 'Bim'
          }
        })
        expect(result).to.be.null()
      })
    })

    describe('when reading by filter', () => {
      it('should return null', async () => {
        const result = await readOne({
          type: table,
          filter: {
            firstName: 'Bim'
          }
        })
        expect(result).to.be.null()
      })
    })

    describe('when id or filters|filter are not passed', () => {
      it('should return null', async () => {
        const result = await readOne({
          type: table
        })
        expect(result).to.be.null()
      })
    })
  })
})
