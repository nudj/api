/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const { endOfDay, startOfDay } = require('../../../gql/lib/format-dates')

describe('format-dates', () => {
  describe('endOfDay', () => {
    it('should format timestamps to the last second of the day', () => {
      const today = '2018-02-06T09:51:58.000+00:00'
      expect(endOfDay(today)).to.equal('2018-02-06T23:59:59.999Z')
    })

    it('should format shorter timestamps', () => {
      expect(endOfDay('2017-02-06')).to.equal('2017-02-06T23:59:59.999Z')
    })

    it('should return if passed a nil value', () => {
      expect(endOfDay(null)).to.be.undefined()
      expect(endOfDay()).to.be.undefined()
    })

    it('should throw error if passed a non-timestamp object', () => {
      expect(() => endOfDay([])).to.throw('Invalid timestamp')
      expect(() => endOfDay({})).to.throw('Invalid timestamp')
      expect(() => endOfDay(() => {})).to.throw('Invalid timestamp')
      expect(() => endOfDay('Diet Coke')).to.throw('Invalid timestamp')
    })

    it('should return if passed a nil value', () => {
      expect(endOfDay(null)).to.be.undefined()
      expect(endOfDay()).to.be.undefined()
    })
  })

  describe('startOfDay', () => {
    it('should format timestamps to the first second of the day', () => {
      const today = '2018-02-06T09:51:58.000+00:00'
      expect(startOfDay(today)).to.equal('2018-02-06T00:00:00.000Z')
    })

    it('should format shorter timestamps', () => {
      expect(startOfDay('2017-02-06')).to.equal('2017-02-06T00:00:00.000Z')
    })

    it('should return if passed a nil value', () => {
      expect(startOfDay(null)).to.be.undefined()
      expect(startOfDay()).to.be.undefined()
    })

    it('should throw error if passed a non-timestamp object', () => {
      expect(() => startOfDay([])).to.throw('Invalid timestamp')
      expect(() => startOfDay({})).to.throw('Invalid timestamp')
      expect(() => startOfDay(() => {})).to.throw('Invalid timestamp')
      expect(() => startOfDay('Diet Coke')).to.throw('Invalid timestamp')
    })
  })
})
