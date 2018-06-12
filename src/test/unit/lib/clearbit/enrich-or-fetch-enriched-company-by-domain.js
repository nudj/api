/* eslint-env mocha */
const chai = require('chai')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

const expect = chai.expect
const enrichCompanyByDomainStub = sinon.stub()
const storeReadOneStub = sinon.stub()
const nosqlReadOneStub = sinon.stub()
const loggerStub = sinon.stub()

nosqlReadOneStub.returns(null)
storeReadOneStub.returns(null)

nosqlReadOneStub.withArgs({
  type: 'enrichedCompanies',
  filters: { domain: 'current.co' }
}).returns({ id: 'current', name: 'current' })

nosqlReadOneStub.withArgs({
  type: 'enrichedCompanies',
  filters: { domain: 'new.co' }
}).returns({ id: 'new', name: 'new' })

storeReadOneStub.withArgs({
  type: 'companies',
  filters: {
    name: 'current'
  }
}).returns({ id: 'current', name: 'current' })

storeReadOneStub.withArgs({
  type: 'companies',
  filters: {
    name: 'new'
  }
}).returns(null)

enrichCompanyByDomainStub.withArgs('anotherNew.Co')
  .returns({ id: 'anotherNewCo', name: 'anotherNewCo' })

chai.use(sinonChai)

describe('Clearbit.enrichOrFetchEnrichedCompanyByDomain', () => {
  const fakeContext = {
    store: {
      readOne: storeReadOneStub
    },
    nosql: {
      readOne: nosqlReadOneStub
    }
  }
  let enrichOrFetchEnrichedCompanyByDomain
  let cachedClearbitStatus
  beforeEach(() => {
    enrichOrFetchEnrichedCompanyByDomain = proxyquire('../../../../gql/lib/clearbit/enrich-or-fetch-enriched-company-by-domain', {
      './enrich-company-by-domain': enrichCompanyByDomainStub,
      '@nudj/library': {
        logger: loggerStub
      }
    })
  })

  afterEach(() => {
    enrichCompanyByDomainStub.reset()
    nosqlReadOneStub.reset()
    storeReadOneStub.reset()
    loggerStub.reset()
  })

  before(() => {
    cachedClearbitStatus = process.env.CLEARBIT_ENABLED
    process.env.CLEARBIT_ENABLED = 'true'
  })

  after(() => {
    process.env.CLEARBIT_ENABLED = cachedClearbitStatus
  })

  describe('when the enriched company already exists', () => {
    it('does not enrich the data', async () => {
      await enrichOrFetchEnrichedCompanyByDomain('current.co', fakeContext)
      expect(enrichCompanyByDomainStub).to.not.have.been.called()
    })

    describe('and the company exists', () => {
      it('returns both the company and the enriched company', async () => {
        const {
          company,
          enrichedCompany
        } = await enrichOrFetchEnrichedCompanyByDomain('current.co', fakeContext)

        expect(company).to.deep.equal({ id: 'current', name: 'current' })
        expect(enrichedCompany).to.deep.equal({ id: 'current', name: 'current' })
      })
    })

    describe('but the company does not', () => {
      it('returns the enriched company and `null` for the company', async () => {
        const {
          company,
          enrichedCompany
        } = await enrichOrFetchEnrichedCompanyByDomain('new.co', fakeContext)

        expect(company).to.be.null()
        expect(enrichedCompany).to.deep.equal({ id: 'new', name: 'new' })
      })
    })
  })

  describe('when the enriched company doesn\'t exist', () => {
    it('does not attempt to fetch the company', async () => {
      await enrichOrFetchEnrichedCompanyByDomain('anotherNew.Co', fakeContext)
      expect(storeReadOneStub).to.not.have.been.called()
    })

    it('returns the enriched company and `null` for the company', async () => {
      const {
        company,
        enrichedCompany
      } = await enrichOrFetchEnrichedCompanyByDomain('anotherNew.Co', fakeContext)

      expect(company).to.be.null()
      expect(enrichedCompany).to.deep.equal({ id: 'anotherNewCo', name: 'anotherNewCo' })
    })
  })

  describe('when the request errors', () => {
    beforeEach(() => {
      enrichCompanyByDomainStub.throws('500: Clearbit Is Well Dead')
    })

    it('logs the error', async () => {
      await enrichOrFetchEnrichedCompanyByDomain('domain.co', fakeContext)
      expect(loggerStub).to.have.been.called()
    })

    it('returns null for both `company` and `enrichedCompany`', async () => {
      const result = await enrichOrFetchEnrichedCompanyByDomain('domain.co', fakeContext)
      expect(result).to.deep.equal({ company: null, enrichedCompany: null })
    })
  })
})
