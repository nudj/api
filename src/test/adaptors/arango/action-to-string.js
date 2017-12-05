/* eslint-env mocha */

const chai = require('chai')
const expect = chai.expect

const ActionToString = require('../../../gql/adaptors/arango/action-to-string')

const STORE_NOOP = () => {}
const ACTION_NOOP = () => {}

describe('ArangoAdaptor ActionToString', () => {
  it('to be a function', () => {
    expect(ActionToString).to.be.a('function')
  })

  it('should take a store', () => {
    expect(() => ActionToString()).to.throw('No store supplied')
  })

  it('should take an action', () => {
    expect(() => ActionToString(STORE_NOOP)).to.throw('No action supplied')
  })

  describe('return value', () => {
    it('should be a string', () => {
      expect(ActionToString(STORE_NOOP, ACTION_NOOP)).to.be.a('string')
    })

    it('should start with a function declaration with single "params" arg', () => {
      expect(ActionToString(STORE_NOOP, ACTION_NOOP).slice(0, 19)).to.equal('function (params) {')
    })

    it('should end with a function closure', () => {
      const result = ActionToString(STORE_NOOP, ACTION_NOOP)
      expect(result.slice(-1)).to.equal('}')
    })

    it('should contain a stringified version of the store', () => {
      const result = ActionToString(() => ({
        key1: (arg1) => { return 'value1' },
        key2: (arg2) => { return 'value2' }
      }), ACTION_NOOP)
      expect(result).to.contain.string(`const store = () => ({
        key1: (arg1) => { return 'value1' },
        key2: (arg2) => { return 'value2' }
      })`)
    })

    it('should contain a stringified version of the action', () => {
      const result = ActionToString(STORE_NOOP, (args) => {
        return args.test
      })
      expect(result).to.contain.string(`const action = (args) => {
        return args.test
      }`)
    })

    it('should contain a stringified invocation of action with initialised store and params passed in', () => {
      const result = ActionToString(STORE_NOOP, ACTION_NOOP)
      expect(result).to.contain.string('return action(store(), params)')
    })
  })
})
