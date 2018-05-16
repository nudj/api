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

describe('mysql: store.delete', () => {
  let del
  const table = 'people'

  beforeEach(async () => {
    const store = Store({ db: sql })
    del = store.delete
  })

  afterEach(async () => {
    await sql(TABLES.PEOPLE).whereNot('id', '').del()
  })

  it('should exist', () => {
    expect(del).to.exist()
  })

  describe('when passing valid data', () => {
    let id
    let result

    beforeEach(async () => {
      [ id ] = await sql(table).insert({
        email: 'bim@job.com',
        firstName: 'Bim',
        lastName: 'Job',
        url: 'https://bimjob.com/hi'
      })
      result = await del({
        type: table,
        id
      })
    })

    it('should delete the record in table', async () => {
      const [ record ] = await sql.select().from(table)
      expect(record).to.have.be.undefined()
    })

    it('should return the deleted entity', async () => {
      expect(result).to.have.property('id', id)
      expect(result).to.have.property('created')
      expect(result).to.have.property('modified')
      expect(result).to.have.property('email', 'bim@job.com')
      expect(result).to.have.property('firstName', 'Bim')
      expect(result).to.have.property('lastName', 'Job')
      expect(result).to.have.property('url', 'https://bimjob.com/hi')
    })
  })
})
