/* eslint-env mocha */
const sinon = require('sinon')
const dedent = require('dedent')

const {
  db,
  noSQL,
  setupCollections,
  populateCollections,
  truncateCollections,
  teardownCollections,
  expect
} = require('../../lib')
const script = require('../../../../scripts/00003-enriched-company-count')
const executeScript = () => script({ db, noSQL })

describe('00003 Enriched Company Count', () => {
  let consoleStub

  before(async () => {
    await Promise.all([
      setupCollections(db, ['companies']),
      setupCollections(noSQL, ['enrichedCompanies'])
    ])
  })

  beforeEach(async () => {
    await populateCollections(db, [
      {
        name: 'companies',
        data: [
          {
            _key: 'company1',
            name: 'Company One'
          },
          {
            _key: 'company2',
            name: 'Company Two'
          },
          {
            _key: 'company3',
            name: 'Company Three'
          },
          {
            _key: 'company4',
            name: 'Company Four'
          },
          {
            _key: 'company5',
            name: 'Company Five'
          }
        ]
      }
    ])
    await populateCollections(noSQL, [
      {
        name: 'enrichedCompanies',
        data: [
          {
            _key: 'company1',
            data: 'BigData'
          },
          {
            _key: 'company4',
            data: 'HugeData'
          },
          {
            _key: 'company5',
            data: 'TeenyData'
          }
        ]
      }
    ])
    consoleStub = sinon.stub(console, 'log')
    await executeScript()
    consoleStub.restore()
  })

  afterEach(async () => {
    consoleStub.reset()
    await Promise.all([truncateCollections(db), truncateCollections(noSQL)])
  })

  after(async () => {
    await Promise.all([teardownCollections(db), teardownCollections(noSQL)])
  })

  it('should output the company counts to the console', async () => {
    const { args: consoleOutput } = consoleStub.getCalls()[0].proxy
    expect(consoleOutput[0]).to.deep.equal([
      dedent(`
        5 companies in db:
          - 3 enriched
          - 2 unenriched
      `)
    ])
  })
})
