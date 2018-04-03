/* eslint-env mocha */
const proxyquire = require('proxyquire')
const { expect } = require('chai')
const sinon = require('sinon')

const hashGenerator = sinon.stub().returns('HASH')
hashGenerator.onCall(2).returns('HASH')
hashGenerator.onCall(3).returns('WEED')
hashGenerator.onCall(4).returns('WEED')
hashGenerator.onCall(5).returns('WEED')
hashGenerator.onCall(6).returns('GREEN')
hashGenerator.onCall(7).returns('GREEN')
hashGenerator.onCall(8).returns('GREEN')
hashGenerator.onCall(9).returns('GREEN')
hashGenerator.onCall(10).returns('GANJA')

const getMakeCompanyUniqueSlug = proxyquire('../../../../gql/lib/helpers/make-unique-company-slug', {
  '@nudj/library': {
    generateId: (type, object) => object.name
  },
  'hash-generator': hashGenerator
})

const companyCache = {
  'Company 1': {
    id: 'Company 1',
    name: 'Company 1',
    slug: 'company-1'
  },
  'Company 2': {
    id: 'Company 2',
    name: 'Company 2'
  },
  'nike': {
    id: 'nike',
    name: 'nike',
    slug: 'nike'
  }
}

describe('getMakeCompanyUniqueSlug', () => {
  describe('when the company and `slug` don\'t exist', () => {
    it('generates a `slug`', () => {
      const slug = getMakeCompanyUniqueSlug(companyCache)({ id: 'Company 3', name: 'Company 3' })
      expect(slug).to.equal('company-3')
    })
  })

  describe('when the company exists in the list of companies', () => {
    describe('and `company.slug` exists', () => {
      it('returns the existing slug', () => {
        const slug = getMakeCompanyUniqueSlug(companyCache)({ id: 'Company 1', name: 'Company 1' })
        expect(slug).to.equal('company-1')
      })
    })

    describe('and `company.slug` doesnt exist', () => {
      it('generates a `slug`', () => {
        const slug = getMakeCompanyUniqueSlug(companyCache)({ id: 'Company 2', name: 'Company 2' })
        expect(slug).to.equal('company-2')
      })
    })
  })

  describe('when the company doesnt exist but the slug does', () => {
    it('generates the same `slug` with a hash on the end', () => {
      const slug = getMakeCompanyUniqueSlug(companyCache)({ id: 'niké', name: 'niké' })
      expect(slug).to.equal('nike-HASH')
    })

    describe('when multiple companies generate the same slug', () => {
      it('generates totally unique `slug`s for each company', () => {
        const makeCompanyUniqueSlug = getMakeCompanyUniqueSlug(companyCache)

        const slugOne = makeCompanyUniqueSlug({ id: 'niké', name: 'niké' })
        expect(slugOne).to.equal('nike-HASH')

        const slugTwo = makeCompanyUniqueSlug({ id: 'nikē', name: 'nikē' })
        expect(slugTwo).to.equal('nike-WEED')

        const slugThree = makeCompanyUniqueSlug({ id: 'nikė', name: 'nikė' })
        expect(slugThree).to.equal('nike-GREEN')

        const slugFour = makeCompanyUniqueSlug({ id: 'nikę', name: 'nikę' })
        expect(slugFour).to.equal('nike-GANJA')
      })
    })
  })
})
