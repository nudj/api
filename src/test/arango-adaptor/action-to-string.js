/* eslint-env mocha */

const chai = require('chai')
const expect = chai.expect

const ActionToString = require('../../gql/arango-adaptor/action-to-string')

describe('ArangoAdaptor ActionToString', () => {
  it('to be a function', () => {
    expect(ActionToString).to.be.a('function')
  })

  it('should take a store', () => {
    expect(() => ActionToString()).to.throw('No store supplied')
  })

  it('should take an action', () => {
    expect(() => ActionToString({})).to.throw('No action supplied')
  })

  describe('return value', () => {
    it('should be a string', () => {
      expect(ActionToString({}, () => {})).to.be.a('string')
    })

    it('should start with a function declaration with single "params" arg', () => {
      expect(ActionToString({}, () => {}).slice(0, 19)).to.equal('function (params) {')
    })

    it('should end with a function closure', () => {
      const result = ActionToString({}, () => {})
      expect(result[result.length - 1]).to.equal('}')
    })

    it('should contain a stringified version of the store', () => {
      const result = ActionToString({
        key1: (arg1) => { return 'value1' },
        key2: (arg2) => { return 'value2' }
      }, () => {})
      expect(result).to.contain.string(`const store = { key1: (arg1) => { return 'value1' }, key2: (arg2) => { return 'value2' } }`)
    })

    it('should contain a stringified version of the action', () => {
      const result = ActionToString({}, (args) => {
        return args.test
      })
      expect(result).to.contain.string(`const action = (args) => {
        return args.test
      }`)
    })

    it('should contain a stringified invocation of action with store as the argument', () => {
      const result = ActionToString({}, () => {})
      expect(result).to.contain.string('return action(store)')
    })
  })
})
