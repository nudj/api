/* eslint-env mocha */
const chai = require('chai')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

const expect = chai.expect
chai.use(sinonChai)

const CLEARBIT_RESPONSE = 'MUCH DATA, SUCH ENRICHMENT'

const companyDomainToNameStub = sinon.stub().returns({ domain: CLEARBIT_RESPONSE })

const apiStub = {
  NameToDomain: {
    find: companyDomainToNameStub
  }
}

describe('Clearbit.fetchDomainForCompany', () => {
  let fetchDomainForCompany
  beforeEach(() => {
    fetchDomainForCompany = proxyquire('../../../../gql/lib/clearbit/fetch-domain-for-company', {
      './api': apiStub
    })
  })

  afterEach(() => {
    companyDomainToNameStub.reset()
  })

  describe('when the request succeeds', () => {
    it('calls Clearbit api with provided company name', async () => {
      await fetchDomainForCompany('Comapny Inc')
      expect(companyDomainToNameStub).to.have.been.calledWith({
        name: 'Comapny Inc',
        stream: true
      })
    })

    it('calls Clearbit api with provided options', async () => {
      await fetchDomainForCompany('Comapny Inc', { stream: false })
      expect(companyDomainToNameStub).to.have.been.calledWith({
        name: 'Comapny Inc',
        stream: false
      })
    })

    it('returns the value of the api call', async () => {
      const result = await fetchDomainForCompany('Comapny Inc', { stream: false })
      expect(result).to.equal(CLEARBIT_RESPONSE)
    })
  })

  describe('when the request fails', () => {
    it('returns null if not found', async () => {
      companyDomainToNameStub.throws(Error('Resource not found'))
      const result = await fetchDomainForCompany('Comapny Inc', { stream: false })
      expect(result).to.be.null()
    })

    it('throws "resource queued" error if request is queued', async () => {
      companyDomainToNameStub.throws(Error('Resource lookup queued'))
      expect(
        fetchDomainForCompany('Comapny Inc', { stream: false })
      ).to.eventually.be.rejectedWith('Resource lookup queued for Comapny Inc')
    })

    it('throws if error is returned', async () => {
      companyDomainToNameStub.throws(Error('Super Epic Fail'))
      expect(
        fetchDomainForCompany('Comapny Inc', { stream: false })
      ).to.eventually.be.rejectedWith('Super Epic Fail')
    })
  })
})
