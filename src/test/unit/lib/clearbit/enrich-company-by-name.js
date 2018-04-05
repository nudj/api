/* eslint-env mocha */
const chai = require('chai')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

const expect = chai.expect
const fetchDomainForCompanyStub = sinon.stub()
const enrichCompanyByDomainStub = sinon.stub()
const CLEARBIT_RESPONSE = 'MUCH DATA, SUCH ENRICHMENT'

chai.use(sinonChai)

describe('Clearbit.enrichCompanyByName', () => {
  let enrichCompanyByName
  beforeEach(() => {
    enrichCompanyByName = proxyquire('../../../../gql/lib/clearbit/enrich-company-by-name', {
      './fetch-domain-for-company': fetchDomainForCompanyStub,
      './enrich-company-by-domain': enrichCompanyByDomainStub
    })
  })

  afterEach(() => {
    fetchDomainForCompanyStub.reset()
    enrichCompanyByDomainStub.reset()
  })

  describe('when the request succeeds', () => {
    beforeEach(() => {
      fetchDomainForCompanyStub.returns('comapny.co.uk')
      enrichCompanyByDomainStub.returns(CLEARBIT_RESPONSE)
    })

    it('calls `fetchDomainForCompany` with provided company name', async () => {
      await enrichCompanyByName('Comapny Inc')
      expect(fetchDomainForCompanyStub).to.have.been.calledWith('Comapny Inc')
    })

    it('calls `fetchDomainForCompany` with provided options', async () => {
      await enrichCompanyByName('Comapny Inc', { stream: false })
      expect(fetchDomainForCompanyStub).to.have.been.calledWith('Comapny Inc', {
        stream: false
      })
    })

    it('calls `fetchCompanyByDomain` with fetched domain name', async () => {
      await enrichCompanyByName('Comapny Inc')
      expect(enrichCompanyByDomainStub).to.have.been.calledWith('comapny.co.uk')
    })

    it('calls `fetchCompanyByDomain` with provided options', async () => {
      await enrichCompanyByName('Comapny Inc', { stream: false })
      expect(enrichCompanyByDomainStub).to.have.been.calledWith('comapny.co.uk', {
        stream: false
      })
    })

    it('returns the fetched company', async () => {
      const result = await enrichCompanyByName('Comapny Inc')
      expect(result).to.equal(CLEARBIT_RESPONSE)
    })
  })

  describe('when the request fails', () => {
    it('returns null if no company is found by name', async () => {
      enrichCompanyByDomainStub.returns(null)
      const result = await enrichCompanyByName('Comapny Inc')
      expect(result).to.be.null()
    })

    it('returns null if no company domain is found', async () => {
      fetchDomainForCompanyStub.returns()
      const result = await enrichCompanyByName('Comapny Inc', { stream: false })
      expect(result).to.be.null()
    })
  })
})
