/* eslint-env mocha */
const { expect } = require('chai')
const sinon = require('sinon')

const makeUniqueSlug = require('../../../../gql/lib/helpers/make-unique-slug')

const readOneStub = sinon.stub()
const context = {
  sql: {
    readOne: readOneStub
  }
}

describe('makeUniqueSlug', () => {
  beforeEach(() => {
    readOneStub.reset()
  })

  it('generates slug appropriate to provided `type`', async () => {
    const company = { name: 'Name Based', description: 'We are fake' }
    const survey = { name: 'specialSurvey', introTitle: 'Yay survey' }

    const companySlug = await makeUniqueSlug({
      type: 'companies',
      data: company,
      context
    })
    const surveySlug = await makeUniqueSlug({
      type: 'surveys',
      data: survey,
      context
    })

    expect(companySlug).to.equal('name-based')
    expect(surveySlug).to.equal('yay-survey')
  })

  it('checks db for entity of specified `type` with generated slug', async () => {
    const companySlug = await makeUniqueSlug({
      type: 'companies',
      data: { name: 'Name Based' },
      context
    })

    expect(readOneStub).to.have.been.calledWith({
      type: 'companies',
      filters: { slug: companySlug }
    })
  })

  describe('when first slug is unique', () => {
    it('returns the first slug', async () => {
      const result = await makeUniqueSlug({
        type: 'companies',
        data: { name: 'Name Based' },
        context
      })

      expect(result).to.equal('name-based')
      expect(readOneStub).to.have.been.calledOnce()
    })
  })

  describe('when first slug is not unique', () => {
    it('generates and returns a new unique slug', async () => {
      readOneStub.returns({ name: 'Namé Basëd', slug: 'name-based' })
      readOneStub.onCall(2).returns(null) // On third attempt

      const company = { name: 'Name Based' }
      const result = await makeUniqueSlug({
        type: 'companies',
        data: company,
        context
      })

      expect(result).to.be.a('string')
      expect(result).to.match(/name-based-[a-z0-9]{8}/)
      expect(result.length).to.be.greaterThan(company.name.length)
      expect(readOneStub).to.have.been.calledThrice()
    })
  })
})
