/* eslint-env mocha */
const chai = require('chai')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

const expect = chai.expect
chai.use(sinonChai)

const CLEARBIT_RESPONSE = 'MUCH DATA, SUCH ENRICHMENT'

const companyFindStub = sinon.stub().returns(CLEARBIT_RESPONSE)

const apiStub = {
  Company: {
    find: companyFindStub
  }
}

describe('Clearbit.enrichCompanyByDomain', () => {
  let enrichCompanyByDomain
  let cachedClearbitStatus
  beforeEach(() => {
    enrichCompanyByDomain = proxyquire('../../../../gql/lib/clearbit/enrich-company-by-domain', {
      './api': apiStub
    })
  })

  afterEach(() => {
    companyFindStub.reset()
  })

  before(() => {
    cachedClearbitStatus = process.env.CLEARBIT_ENABLED
    process.env.CLEARBIT_ENABLED = 'true'
  })

  after(() => {
    process.env.CLEARBIT_ENABLED = cachedClearbitStatus
  })

  describe('when the request succeeds', () => {
    it('calls Clearbit api with provided domain', async () => {
      await enrichCompanyByDomain('comapny.co.uk')
      expect(companyFindStub).to.have.been.calledWith({
        domain: 'comapny.co.uk',
        stream: true
      })
    })

    it('calls Clearbit api with provided options', async () => {
      await enrichCompanyByDomain('comapny.co.uk', { stream: false })
      expect(companyFindStub).to.have.been.calledWith({
        domain: 'comapny.co.uk',
        stream: false
      })
    })

    it('returns the value of the api call', async () => {
      const result = await enrichCompanyByDomain('comapny.co.uk', { stream: false })
      expect(result).to.equal(CLEARBIT_RESPONSE)
    })
  })

  describe('when the request fails', () => {
    it('returns null if not found', async () => {
      companyFindStub.throws(Error('Resource not found'))
      const result = await enrichCompanyByDomain('comapny.co.uk', { stream: false })
      expect(result).to.be.null()
    })

    it('throws "resource queued" error if request is queued', async () => {
      companyFindStub.throws(Error('Resource lookup queued'))
      expect(
        enrichCompanyByDomain('comapny.co.uk')
      ).to.eventually.be.rejectedWith('Resource lookup queued for comapny.co.uk')
    })

    it('throws if error is returned', async () => {
      companyFindStub.throws(Error('Super Epic Fail'))
      expect(
        enrichCompanyByDomain('comapny.co.uk', { stream: false })
      ).to.eventually.be.rejectedWith('Super Epic Fail')
    })
  })
})
