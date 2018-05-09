/* eslint-env mocha */
const chai = require('chai')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

const expect = chai.expect
const enrichCompanyByNameStub = sinon.stub()
const readOneStub = sinon.stub()
const createStub = sinon.stub()
const loggerStub = sinon.stub()

chai.use(sinonChai)

describe('Clearbit.enrichOrFetchCachedCompanyByName', () => {
  const fakeContext = {
    noSQL: {
      readOne: readOneStub,
      create: createStub
    }
  }
  let enrichOrFetchCachedCompanyByName
  beforeEach(() => {
    enrichOrFetchCachedCompanyByName = proxyquire('../../../../gql/lib/clearbit/enrich-or-fetch-cached-company-by-name', {
      './enrich-company-by-name': enrichCompanyByNameStub,
      '@nudj/library': {
        logger: loggerStub
      }
    })
  })

  afterEach(() => {
    enrichCompanyByNameStub.reset()
    readOneStub.reset()
    createStub.reset()
    loggerStub.reset()
  })

  it('calls `fetchCompanyByName` with provided company name', async () => {
    await enrichOrFetchCachedCompanyByName('Comapny Inc', fakeContext)
    expect(enrichCompanyByNameStub).to.have.been.calledWith('Comapny Inc')
  })

  describe('when the enriched company already exists', () => {
    beforeEach(() => {
      readOneStub.returns({ id: 'company1', name: 'Comapny Inc' })
    })

    it('does not enrich the data', async () => {
      await enrichOrFetchCachedCompanyByName('Comapny Inc', fakeContext)
      expect(enrichCompanyByNameStub).to.not.have.been.called()
    })

    it('does not create a company', async () => {
      await enrichOrFetchCachedCompanyByName('Comapny Inc', fakeContext)
      expect(createStub).to.not.have.been.called()
    })
  })

  describe('when the enriched company does not exist', () => {
    describe('when the enrichment succeeds', () => {
      beforeEach(() => {
        readOneStub.returns(null)
        enrichCompanyByNameStub.returns({ name: 'Comapny Inc' })
      })

      it('creates an enriched company', async () => {
        await enrichOrFetchCachedCompanyByName('Comapny Inc', fakeContext)
        expect(createStub).to.have.been.called()
      })
    })

    describe('when the enrichment fails', () => {
      beforeEach(() => {
        readOneStub.returns(null)
        enrichCompanyByNameStub.returns(null)
      })

      it('does not create an enriched company', async () => {
        await enrichOrFetchCachedCompanyByName('Comapny Inc', fakeContext)
        expect(createStub).to.not.have.been.called()
      })

      it('returns the result of the attempted enrichment', async () => {
        const result = await enrichOrFetchCachedCompanyByName('Comapny Inc', fakeContext)
        expect(result).to.be.null()
      })

      describe('when the request errors', () => {
        beforeEach(() => {
          readOneStub.returns(null)
          enrichCompanyByNameStub.throws('500: Clearbit Is Well Dead')
        })

        it('logs the error', async () => {
          await enrichOrFetchCachedCompanyByName('Comapny Inc', fakeContext)
          expect(loggerStub).to.have.been.called()
        })

        it('returns null', async () => {
          const result = await enrichOrFetchCachedCompanyByName('Comapny Inc', fakeContext)
          expect(result).to.be.null()
        })
      })
    })
  })
})
