/* eslint-env mocha */
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const flatten = require('lodash/flatten')
const orderBy = require('lodash/orderBy')
const times = require('lodash/times')

const { fetchAll } = require('../../../../lib')

const {
  db,
  noSQL,
  setupCollections,
  populateCollections,
  truncateCollections,
  teardownCollections,
  expect
} = require('../../lib')

const clearbitStub = sinon.stub()
const CLEARBIT_ID = 'CLEARBIT_ID'
const CLEARBIT_DATA = 'CLEARBIT_DATA'

const script = proxyquire('../../../../scripts/00004-enrich-companies', {
  '../../gql/lib/clearbit': {
    enrichCompanyByName: clearbitStub
  }
})
const executeScript = (arg) => script({ db, noSQL, arg })

const fetchStubCalls = (stub) => {
  const { args } = stub.getCalls()[0].proxy
  return flatten(args)
}

describe('00004 Enrich Companies', () => {
  before(async () => {
    await Promise.all([
      setupCollections(db, ['companies']),
      setupCollections(noSQL, ['enrichedCompanies'])
    ])
  })

  beforeEach(async () => {
    clearbitStub.reset()
    clearbitStub.returns({ id: CLEARBIT_ID, data: CLEARBIT_DATA })
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
  })

  afterEach(async () => {
    await Promise.all([truncateCollections(db), truncateCollections(noSQL)])
  })

  after(async () => {
    await Promise.all([teardownCollections(db), teardownCollections(noSQL)])
  })

  it('enriches unenriched companies', async () => {
    await executeScript()
    const stubCalls = fetchStubCalls(clearbitStub)
    expect(stubCalls).to.deep.equal(['Company Two', 'Company Three'])
  })

  describe('when enrichment returns data', () => {
    it('stores enriched data', async () => {
      await executeScript()
      const enrichedCompanies = orderBy(
        await fetchAll(noSQL, 'enrichedCompanies'),
        '_key'
      )

      expect(enrichedCompanies.length).to.equal(5)
      expect(enrichedCompanies[1]).to.have.property('_key').to.equal('company2')
      expect(enrichedCompanies[1]).to.have.property('data').to.equal(CLEARBIT_DATA)
      expect(enrichedCompanies[1]).to.have.property('clearbitId').to.equal(CLEARBIT_ID)
      expect(enrichedCompanies[2]).to.have.property('_key').to.equal('company3')
      expect(enrichedCompanies[2]).to.have.property('data').to.equal(CLEARBIT_DATA)
      expect(enrichedCompanies[2]).to.have.property('clearbitId').to.equal(CLEARBIT_ID)
    })

    describe('when no amount is specified', () => {
      describe('when unenriched count is lower than default enrichment amount', () => {
        it('enriches by the count of unenriched companies', async () => {
          await executeScript()
          expect(clearbitStub).to.have.been.calledTwice()
        })
      })

      describe('when unenriched count is higher than default enrichment amount', () => {
        beforeEach(async () => {
          let count = 0
          await populateCollections(db, [
            {
              name: 'companies',
              data: times(100, () => {
                const data = `anotherCompany${count++}`
                return { _key: data, name: data }
              })
            }
          ])
        })

        it('enriches by the default enrichment amount', async () => {
          await executeScript()
          expect(clearbitStub).to.have.callCount(50)
        })
      })
    })

    describe('when amount is specified', () => {
      it('enriches by the specified amount', async () => {
        await executeScript(1)
        expect(clearbitStub).to.have.been.calledOnce()
      })
    })
  })

  describe('when enrichment returns nothing', () => {
    it('stores company to record attempted enrichment', async () => {
      clearbitStub.returns()
      await executeScript()
      const enrichedCompanies = orderBy(
        await fetchAll(noSQL, 'enrichedCompanies'),
        '_key'
      )

      expect(enrichedCompanies.length).to.equal(5)
      expect(enrichedCompanies[1]).to.not.have.property('data')
      expect(enrichedCompanies[1]).to.not.have.property('id')
      expect(enrichedCompanies[2]).to.not.have.property('data')
      expect(enrichedCompanies[2]).to.not.have.property('id')
    })
  })

  describe('when enrichment errors', () => {
    it('does not store a new company entry', async () => {
      const error = new Error('Massive Clearbit Tantrum')
      const consoleErrorStub = sinon.stub(console, 'error')

      clearbitStub.throws(error)
      await executeScript()
      consoleErrorStub.restore()

      const errorLogs = fetchStubCalls(consoleErrorStub)
      const enrichedCompanies = orderBy(
        await fetchAll(noSQL, 'enrichedCompanies'),
        '_key'
      )

      expect(enrichedCompanies.length).to.equal(3)
      expect(consoleErrorStub).to.have.been.called()
      expect(errorLogs[0]).to.equal('Enrichment error')
      expect(errorLogs[1]).to.deep.equal(error)
    })
  })
})