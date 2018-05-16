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

describe('mysql: store.count', () => {
  let count
  let ids = []
  const table = 'people'

  beforeEach(async () => {
    const store = Store({ db: sql })
    count = store.count
    ids = []
    ids = ids.concat(await sql(table).insert({
      created: '2018-01-01 01:01:01',
      email: 'bim@job.com',
      firstName: 'Bim',
      lastName: 'Job',
      url: 'https://bimjob.com/hi'
    }))
    ids = ids.concat(await sql(table).insert({
      created: '2018-01-15 01:01:01',
      email: 'bom@jib.com',
      firstName: 'Bom',
      lastName: 'Jib',
      url: 'https://bomjib.com/hi'
    }))
    ids = ids.concat(await sql(table).insert({
      created: '2018-02-02 02:02:02',
      email: 'jom@bib.com',
      firstName: 'Jom',
      lastName: 'Bib',
      url: 'https://jombib.com/hi'
    }))
  })

  afterEach(async () => {
    await sql(TABLES.PEOPLE).whereNot('id', '').del()
  })

  it('should exist', () => {
    expect(count).to.exist()
  })

  describe('when requesting all', () => {
    let result

    beforeEach(async () => {
      result = await count({
        type: table
      })
    })

    it('should return number', async () => {
      expect(result).to.be.a('number')
    })

    it('should return correct count', async () => {
      expect(result).to.equal(3)
    })
  })

  describe('when passing filters', () => {
    let result

    beforeEach(async () => {
      result = await count({
        type: table,
        filters: {
          firstName: 'Bom'
        }
      })
    })

    it('should return number', async () => {
      expect(result).to.be.a('number')
    })

    it('should return correct count', async () => {
      expect(result).to.equal(1)
    })
  })

  describe('when passing filter', () => {
    let result

    beforeEach(async () => {
      result = await count({
        type: table,
        filter: {
          firstName: 'Bom'
        }
      })
    })

    it('should return number', async () => {
      expect(result).to.be.a('number')
    })

    it('should return correct count', async () => {
      expect(result).to.equal(1)
    })
  })

  describe('when passing a dateFrom filter', () => {
    let result

    beforeEach(async () => {
      result = await count({
        type: table,
        filters: {
          dateFrom: '2018-02-01 00:00:00'
        }
      })
    })

    it('should return number', async () => {
      expect(result).to.be.a('number')
    })

    it('should return correct count', async () => {
      expect(result).to.equal(1)
    })
  })

  describe('when passing a dateTo filter', () => {
    let result

    beforeEach(async () => {
      result = await count({
        type: table,
        filters: {
          dateTo: '2018-01-10 00:00:00'
        }
      })
    })

    it('should return number', async () => {
      expect(result).to.be.a('number')
    })

    it('should return correct count', async () => {
      expect(result).to.equal(1)
    })
  })

  describe('when passing a dateFrom and dateTo filter', () => {
    let result

    beforeEach(async () => {
      result = await count({
        type: table,
        filters: {
          dateFrom: '2018-01-10 00:00:00',
          dateTo: '2018-02-01 00:00:00'
        }
      })
    })

    it('should return number', async () => {
      expect(result).to.be.a('number')
    })

    it('should return correct count', async () => {
      expect(result).to.equal(1)
    })
  })

  describe('when passing a dateFrom and general filters', () => {
    let result

    beforeEach(async () => {
      result = await count({
        type: table,
        filters: {
          dateFrom: '2018-01-10 00:00:00',
          lastName: 'Jib'
        }
      })
    })

    it('should return number', async () => {
      expect(result).to.be.a('number')
    })

    it('should return correct count', async () => {
      expect(result).to.equal(1)
    })
  })

  describe('when passing a dateTo and general filters', () => {
    let result

    beforeEach(async () => {
      result = await count({
        type: table,
        filters: {
          dateTo: '2018-02-01 00:00:00',
          firstName: 'Bim'
        }
      })
    })

    it('should return number', async () => {
      expect(result).to.be.a('number')
    })

    it('should return correct count', async () => {
      expect(result).to.equal(1)
    })
  })

  describe('when passing a dateFrom and dateTo filter', () => {
    let result

    beforeEach(async () => {
      result = await count({
        type: table,
        filters: {
          dateFrom: '2017-01-10 00:00:00',
          dateTo: '2019-01-10 00:00:00',
          firstName: 'Bom'
        }
      })
    })

    it('should return number', async () => {
      expect(result).to.be.a('number')
    })

    it('should return correct count', async () => {
      expect(result).to.equal(1)
    })
  })
})
