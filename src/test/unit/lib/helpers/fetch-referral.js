/* eslint-env mocha */
const { expect } = require('chai')
const sinon = require('sinon')

const fetchReferral = require('../../../../gql/lib/helpers/fetch-referral')
const { TABLES, INDICES } = require('../../../../lib/sql')

const THE_REFERRAL = 'the_referral'
const context = {
  nosql: {
    readOne: sinon.stub().returns({
      slug: '123'
    })
  },
  sql: {
    readOne: sinon.stub().returns(THE_REFERRAL)
  }
}

describe('fetchReferral', () => {
  afterEach(() => {
    context.nosql.readOne.reset()
    context.sql.readOne.reset()
  })

  describe('when identifier is an old arango id', () => {
    const identifier = '30810601'
    let result

    beforeEach(async () => {
      result = await fetchReferral(context, identifier)
    })

    it('should fetch slugMap from the nosql store', async () => {
      expect(context.nosql.readOne).to.have.been.calledWith({
        type: 'referralKeyToSlugMaps',
        id: identifier
      })
    })

    it('should fetch the referral from sql store by slugMap.slug', async () => {
      expect(context.sql.readOne).to.have.been.calledWith({
        type: 'referrals',
        index: INDICES[TABLES.REFERRALS].slug,
        key: '123'
      })
    })

    it('should return the referral', async () => {
      expect(result).to.equal(THE_REFERRAL)
    })
  })

  describe('when identifier is an old MD5 id', () => {
    const identifier = '745cbb4b67a4d37caadb09f438da7322'
    let result

    beforeEach(async () => {
      result = await fetchReferral(context, identifier)
    })

    it('should fetch slugMap from the nosql store', async () => {
      expect(context.nosql.readOne).to.have.been.calledWith({
        type: 'referralKeyToSlugMaps',
        id: identifier
      })
    })

    it('should fetch the referral from sql store by slugMap.slug', async () => {
      expect(context.sql.readOne).to.have.been.calledWith({
        type: 'referrals',
        index: INDICES[TABLES.REFERRALS].slug,
        key: '123'
      })
    })

    it('should return the referral', async () => {
      expect(result).to.equal(THE_REFERRAL)
    })
  })

  describe('when identifier is a new sql id', () => {
    const identifier = '1'
    let result

    beforeEach(async () => {
      result = await fetchReferral(context, identifier)
    })

    it('should not fetch slugMap from the nosql store', async () => {
      expect(context.nosql.readOne).to.not.have.been.called()
    })

    it('should fetch the referral from sql store by identifier', async () => {
      expect(context.sql.readOne).to.have.been.calledWith({
        type: 'referrals',
        index: INDICES[TABLES.REFERRALS].slug,
        key: identifier
      })
    })

    it('should return the referral', async () => {
      expect(result).to.equal(THE_REFERRAL)
    })
  })

  describe('when identifier looks like an old arango id but is not', () => {
    const identifier = '12345678'
    let result

    beforeEach(async () => {
      context.nosql.readOne.returns(null)
      result = await fetchReferral(context, identifier)
    })

    it('should try to fetch slugMap from the nosql store', async () => {
      expect(context.nosql.readOne).to.have.been.calledWith({
        type: 'referralKeyToSlugMaps',
        id: identifier
      })
    })

    it('should fetch the referral from sql store by identifier', async () => {
      expect(context.sql.readOne).to.have.been.calledWith({
        type: 'referrals',
        index: INDICES[TABLES.REFERRALS].slug,
        key: identifier
      })
    })

    it('should return the referral', async () => {
      expect(result).to.equal(THE_REFERRAL)
    })
  })

  describe('when identifier is undefined', () => {
    const identifier = undefined
    let result

    beforeEach(async () => {
      result = await fetchReferral(context, identifier)
    })

    it('should not try to fetch slugMap from the nosql store', async () => {
      expect(context.nosql.readOne).to.not.have.been.called()
    })

    it('should not fetch the referral from sql store by identifier', async () => {
      expect(context.sql.readOne).to.not.have.been.called()
    })

    it('should return null', async () => {
      expect(result).to.be.null()
    })
  })
})
