/* eslint-env mocha */
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const isAfter = require('date-fns/is_after')
const util = require('util')
const timeout = util.promisify(setTimeout)

chai.use(chaiAsPromised)

const {
  sql,
  expect
} = require('../../lib')
const {
  TABLES
} = require('../../../../lib/sql')

const { store: Store } = require('../../../../gql/adaptors/mysql')

describe('mysql: store.update', () => {
  let update
  let id
  const table = 'people'

  beforeEach(async () => {
    const store = Store({ db: sql })
    update = store.update;
    [ id ] = await sql(table).insert({
      email: 'bim@job.com',
      firstName: 'Bim',
      lastName: 'Job',
      url: 'https://bimjob.com/hi'
    })
    // timeout needed to ensure update happens 1s after insert
    // in order to confirm the modified ts is updated
    await timeout(1000)
  })

  afterEach(async () => {
    await sql(TABLES.PEOPLE).whereNot('id', '').del()
  })

  it('should exist', () => {
    expect(update).to.exist()
  })

  describe('when passing valid data', () => {
    let result

    beforeEach(async () => {
      result = await update({
        type: table,
        id,
        data: {
          firstName: 'New first name'
        }
      })
    })

    it('should update the record in table', async () => {
      const [ record ] = await sql.select().from(table)
      expect(record).to.have.property('firstName', 'New first name')
    })

    it('should return the updated entity', async () => {
      expect(result).to.have.property('id', id)
      expect(result).to.have.property('created')
      expect(result).to.have.property('modified')
      expect(result).to.have.property('email', 'bim@job.com')
      expect(result).to.have.property('firstName', 'New first name')
      expect(result).to.have.property('lastName', 'Job')
      expect(result).to.have.property('url', 'https://bimjob.com/hi')
    })

    it('should update the modified date', async () => {
      expect(isAfter(result.modified, result.created)).to.be.true()
    })
  })
})
