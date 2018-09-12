/* eslint-env mocha */
const { expect } = require('chai')
const sinon = require('sinon')

const fetchReferral = require('../../../../gql/lib/helpers/fetch-referral')
const { TABLES, INDICES } = require('../../../../lib/sql')

const THE_REFERRAL = 'the_referral'

describe('fetchReferral', () => {
  describe('when identifier is an old arango id', () => {
    const identifier = '30810601'
    const sqlReadOneStub = sinon.stub()
    let result
    let context

    beforeEach(async () => {
      sqlReadOneStub
        .onFirstCall()
        .returns({
          slug: '123'
        })
      sqlReadOneStub
        .onSecondCall()
        .returns(THE_REFERRAL)
      context = {
        sql: {
          readOne: sqlReadOneStub
        }
      }
      result = await fetchReferral(context, identifier)
    })

    afterEach(() => {
      sqlReadOneStub.reset()
    })

    it('should fetch slugMap from the sql store', async () => {
      expect(context.sql.readOne).to.have.been.calledWith({
        type: 'referralKeyToSlugMaps',
        index: INDICES[TABLES.REFERRAL_KEY_TO_SLUG_MAP].referralKey,
        key: identifier
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
    const sqlReadOneStub = sinon.stub()
    let result
    let context

    beforeEach(async () => {
      sqlReadOneStub
        .onFirstCall()
        .returns({
          slug: '123'
        })
      sqlReadOneStub
        .onSecondCall()
        .returns(THE_REFERRAL)
      context = {
        sql: {
          readOne: sqlReadOneStub
        }
      }
      result = await fetchReferral(context, identifier)
    })

    afterEach(() => {
      sqlReadOneStub.reset()
    })

    it('should fetch slugMap from the sql store', async () => {
      expect(context.sql.readOne).to.have.been.calledWith({
        type: 'referralKeyToSlugMaps',
        index: INDICES[TABLES.REFERRAL_KEY_TO_SLUG_MAP].referralKey,
        key: identifier
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
    const sqlReadOneStub = sinon.stub()
    let result
    let context

    beforeEach(async () => {
      sqlReadOneStub
        .onFirstCall()
        .returns(THE_REFERRAL)
      context = {
        sql: {
          readOne: sqlReadOneStub
        }
      }
      result = await fetchReferral(context, identifier)
    })

    afterEach(() => {
      sqlReadOneStub.reset()
    })

    it('should not fetch slugMap from the sql store', async () => {
      expect(context.sql.readOne).to.have.been.calledOnce()
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
    const sqlReadOneStub = sinon.stub()
    let result
    let context

    beforeEach(async () => {
      sqlReadOneStub
        .onFirstCall()
        .returns(null)
      sqlReadOneStub
        .onSecondCall()
        .returns(THE_REFERRAL)
      context = {
        sql: {
          readOne: sqlReadOneStub
        }
      }
      result = await fetchReferral(context, identifier)
    })

    afterEach(() => {
      sqlReadOneStub.reset()
    })

    it('should try to fetch slugMap from the sql store', async () => {
      expect(context.sql.readOne).to.have.been.calledWith({
        type: 'referralKeyToSlugMaps',
        index: INDICES[TABLES.REFERRAL_KEY_TO_SLUG_MAP].referralKey,
        key: identifier
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
    const sqlReadOneStub = sinon.stub()
    let result
    let context

    beforeEach(async () => {
      context = {
        sql: {
          readOne: sqlReadOneStub
        }
      }
      result = await fetchReferral(context, identifier)
    })

    it('should not try to fetch slugMap from the sql store', async () => {
      expect(context.sql.readOne).to.not.have.been.called()
    })

    it('should not fetch the referral from sql store by identifier', async () => {
      expect(context.sql.readOne).to.not.have.been.called()
    })

    it('should return null', async () => {
      expect(result).to.be.null()
    })
  })
})
