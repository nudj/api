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

describe('mysql: store.create', () => {
  let create
  let data
  const table = 'people'

  beforeEach(() => {
    const store = Store({ db: sql })
    create = store.create
  })

  afterEach(async () => {
    await sql(TABLES.PEOPLE).whereNot('id', '').del()
  })

  it('should exist', () => {
    expect(create).to.exist()
  })

  describe('when passing valid data', () => {
    beforeEach(() => {
      data = {
        email: 'bim@job.com',
        firstName: 'Bim',
        lastName: 'Job',
        url: 'https://bimjob.com/hi'
      }
    })

    it('should add new record in table', async () => {
      await create({
        type: table,
        data
      })
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
      const result = await create({
        type: table,
        data
      })
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
