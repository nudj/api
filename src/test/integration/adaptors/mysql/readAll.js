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

describe('mysql: store.readAll', () => {
  let readAll
  let ids = []
  const table = 'people'

  beforeEach(async () => {
    const store = Store({ db: sql })
    readAll = store.readAll
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
    expect(readAll).to.exist()
  })

  describe('when requesting all', () => {
    let result

    beforeEach(async () => {
      result = await readAll({
        type: table
      })
    })

    it('should return array', async () => {
      expect(result).to.be.an('array')
    })

    it('should return the records', async () => {
      expect(result).to.have.length(3)
      expect(result[0]).to.have.property('id', ids[0])
      expect(result[1]).to.have.property('id', ids[1])
      expect(result[2]).to.have.property('id', ids[2])
    })

    it('should return all the fields', async () => {
      expect(result[0]).to.have.property('created')
      expect(result[0]).to.have.property('modified')
      expect(result[0]).to.have.property('email', 'bim@job.com')
      expect(result[0]).to.have.property('firstName', 'Bim')
      expect(result[0]).to.have.property('lastName', 'Job')
      expect(result[0]).to.have.property('url', 'https://bimjob.com/hi')

      expect(result[1]).to.have.property('created')
      expect(result[1]).to.have.property('modified')
      expect(result[1]).to.have.property('email', 'bom@jib.com')
      expect(result[1]).to.have.property('firstName', 'Bom')
      expect(result[1]).to.have.property('lastName', 'Jib')
      expect(result[1]).to.have.property('url', 'https://bomjib.com/hi')

      expect(result[2]).to.have.property('created')
      expect(result[2]).to.have.property('modified')
      expect(result[2]).to.have.property('email', 'jom@bib.com')
      expect(result[2]).to.have.property('firstName', 'Jom')
      expect(result[2]).to.have.property('lastName', 'Bib')
      expect(result[2]).to.have.property('url', 'https://jombib.com/hi')
    })
  })

  describe('when passing filters', () => {
    let result

    beforeEach(async () => {
      result = await readAll({
        type: table,
        filters: {
          firstName: 'Bom'
        }
      })
    })

    it('should return array', async () => {
      expect(result).to.be.an('array')
    })

    it('should return filtered records', async () => {
      expect(result).to.have.length(1)
      expect(result[0]).to.have.property('id', ids[1])
    })

    it('should return all the fields', async () => {
      expect(result[0]).to.have.property('created')
      expect(result[0]).to.have.property('modified')
      expect(result[0]).to.have.property('email', 'bom@jib.com')
      expect(result[0]).to.have.property('firstName', 'Bom')
      expect(result[0]).to.have.property('lastName', 'Jib')
      expect(result[0]).to.have.property('url', 'https://bomjib.com/hi')
    })
  })

  describe('when passing filter', () => {
    let result

    beforeEach(async () => {
      result = await readAll({
        type: table,
        filter: {
          firstName: 'Bom'
        }
      })
    })

    it('should return array', async () => {
      expect(result).to.be.an('array')
    })

    it('should return filtered records', async () => {
      expect(result).to.have.length(1)
      expect(result[0]).to.have.property('id', ids[1])
    })

    it('should return all the fields', async () => {
      expect(result[0]).to.have.property('created')
      expect(result[0]).to.have.property('modified')
      expect(result[0]).to.have.property('email', 'bom@jib.com')
      expect(result[0]).to.have.property('firstName', 'Bom')
      expect(result[0]).to.have.property('lastName', 'Jib')
      expect(result[0]).to.have.property('url', 'https://bomjib.com/hi')
    })
  })

  describe('when passing a dateFrom filter', () => {
    let result

    beforeEach(async () => {
      result = await readAll({
        type: table,
        filters: {
          dateFrom: '2018-02-01 00:00:00'
        }
      })
    })

    it('should return array', async () => {
      expect(result).to.be.an('array')
    })

    it('should return filtered records', async () => {
      expect(result).to.have.length(1)
      expect(result[0]).to.have.property('id', ids[2])
    })

    it('should return all the fields', async () => {
      expect(result[0]).to.have.property('created')
      expect(result[0]).to.have.property('modified')
      expect(result[0]).to.have.property('email', 'jom@bib.com')
      expect(result[0]).to.have.property('firstName', 'Jom')
      expect(result[0]).to.have.property('lastName', 'Bib')
      expect(result[0]).to.have.property('url', 'https://jombib.com/hi')
    })
  })

  describe('when passing a dateTo filter', () => {
    let result

    beforeEach(async () => {
      result = await readAll({
        type: table,
        filters: {
          dateTo: '2018-01-10 00:00:00'
        }
      })
    })

    it('should return array', async () => {
      expect(result).to.be.an('array')
    })

    it('should return filtered records', async () => {
      expect(result).to.have.length(1)
      expect(result[0]).to.have.property('id', ids[0])
    })

    it('should return all the fields', async () => {
      expect(result[0]).to.have.property('created')
      expect(result[0]).to.have.property('modified')
      expect(result[0]).to.have.property('email', 'bim@job.com')
      expect(result[0]).to.have.property('firstName', 'Bim')
      expect(result[0]).to.have.property('lastName', 'Job')
      expect(result[0]).to.have.property('url', 'https://bimjob.com/hi')
    })
  })

  describe('when passing a dateFrom and dateTo filter', () => {
    let result

    beforeEach(async () => {
      result = await readAll({
        type: table,
        filters: {
          dateFrom: '2018-01-10 00:00:00',
          dateTo: '2018-02-01 00:00:00'
        }
      })
    })

    it('should return array', async () => {
      expect(result).to.be.an('array')
    })

    it('should return filtered records', async () => {
      expect(result).to.have.length(1)
      expect(result[0]).to.have.property('id', ids[1])
    })

    it('should return all the fields', async () => {
      expect(result[0]).to.have.property('created')
      expect(result[0]).to.have.property('modified')
      expect(result[0]).to.have.property('email', 'bom@jib.com')
      expect(result[0]).to.have.property('firstName', 'Bom')
      expect(result[0]).to.have.property('lastName', 'Jib')
      expect(result[0]).to.have.property('url', 'https://bomjib.com/hi')
    })
  })

  describe('when passing a dateFrom and general filters', () => {
    let result

    beforeEach(async () => {
      result = await readAll({
        type: table,
        filters: {
          dateFrom: '2018-01-10 00:00:00',
          lastName: 'Jib'
        }
      })
    })

    it('should return array', async () => {
      expect(result).to.be.an('array')
    })

    it('should return filtered records', async () => {
      expect(result).to.have.length(1)
      expect(result[0]).to.have.property('id', ids[1])
    })

    it('should return all the fields', async () => {
      expect(result[0]).to.have.property('created')
      expect(result[0]).to.have.property('modified')
      expect(result[0]).to.have.property('email', 'bom@jib.com')
      expect(result[0]).to.have.property('firstName', 'Bom')
      expect(result[0]).to.have.property('lastName', 'Jib')
      expect(result[0]).to.have.property('url', 'https://bomjib.com/hi')
    })
  })

  describe('when passing a dateTo and general filters', () => {
    let result

    beforeEach(async () => {
      result = await readAll({
        type: table,
        filters: {
          dateTo: '2018-02-01 00:00:00',
          firstName: 'Bim'
        }
      })
    })

    it('should return array', async () => {
      expect(result).to.be.an('array')
    })

    it('should return filtered records', async () => {
      expect(result).to.have.length(1)
      expect(result[0]).to.have.property('id', ids[0])
    })

    it('should return all the fields', async () => {
      expect(result[0]).to.have.property('created')
      expect(result[0]).to.have.property('modified')
      expect(result[0]).to.have.property('email', 'bim@job.com')
      expect(result[0]).to.have.property('firstName', 'Bim')
      expect(result[0]).to.have.property('lastName', 'Job')
      expect(result[0]).to.have.property('url', 'https://bimjob.com/hi')
    })
  })

  describe('when passing a dateFrom, dateTo and general filter', () => {
    let result

    beforeEach(async () => {
      result = await readAll({
        type: table,
        filters: {
          dateFrom: '2017-01-10 00:00:00',
          dateTo: '2019-01-10 00:00:00',
          firstName: 'Bom'
        }
      })
    })

    it('should return array', async () => {
      expect(result).to.be.an('array')
    })

    it('should return filtered records', async () => {
      expect(result).to.have.length(1)
      expect(result[0]).to.have.property('id', ids[1])
    })

    it('should return all the fields', async () => {
      expect(result[0]).to.have.property('created')
      expect(result[0]).to.have.property('modified')
      expect(result[0]).to.have.property('email', 'bom@jib.com')
      expect(result[0]).to.have.property('firstName', 'Bom')
      expect(result[0]).to.have.property('lastName', 'Jib')
      expect(result[0]).to.have.property('url', 'https://bomjib.com/hi')
    })
  })
})
