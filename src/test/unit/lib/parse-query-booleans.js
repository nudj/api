/* eslint-env mocha */

const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const dirtyChai = require('dirty-chai')
const parseQueryBooleans = require('../../../lib/parse-query-booleans')
const expect = chai.expect
const next = sinon.stub()

chai.use(dirtyChai)
chai.use(sinonChai)

describe('parseQueryBooleans', () => {
  afterEach(() => {
    next.reset()
  })

  it('parses stringified booleans into boolean values', () => {
    const query = { value: 'true', schmalue: 'false' }
    const req = { query }
    parseQueryBooleans(req, {}, next)
    expect(req.query).to.deep.equal({ value: true, schmalue: false })
  })

  it('parses simple query boolean', () => {
    const req = { query: { client: 'true' } }
    parseQueryBooleans(req, {}, next)
    expect(req.query).to.deep.equal({ client: true })
  })

  it('calls next function upon completion', async () => {
    const req = { query: { client: 'true' } }
    expect(next).to.not.have.been.called()
    parseQueryBooleans(req, {}, next)
    expect(next).to.have.been.called()
  })

  it('parses nested queries', async () => {
    const req = {
      query: {
        client: 'true',
        nested: {
          special: 'false'
        }
      }
    }
    parseQueryBooleans(req, {}, next)
    expect(req.query).to.deep.equal({
      client: true,
      nested: {
        special: false
      }
    })
  })

  it('ignores strings that aren\'t stringified booleans', () => {
    const req = {
      query: {
        client: 'true',
        badguy: 'truefacts',
        love: 'false',
        zeroes: 'falsey',
        dogs: 'areamazing'
      }
    }
    parseQueryBooleans(req, {}, next)
    expect(req.query).to.deep.equal({
      client: true,
      badguy: 'truefacts',
      love: false,
      zeroes: 'falsey',
      dogs: 'areamazing'
    })
  })

  it('parses a nested array', () => {
    const req = {
      query: {
        client: 'true',
        badguy: 'truefacts',
        list: [ 'true', 'blue', 'false', 'small' ],
        dogs: 'areamazing'
      }
    }
    parseQueryBooleans(req, {}, next)
    expect(req.query).to.deep.equal({
      client: true,
      badguy: 'truefacts',
      list: [ true, 'blue', false, 'small' ],
      dogs: 'areamazing'
    })
  })

  it('parses complicated query objects', () => {
    const req = {
      query: {
        account: {
          type: 'serial',
          client: 'true',
          reallyNested: {
            val: 'truth',
            dal: 'true',
            smal: 'false',
            alreadyfalse: false,
            str: 'stringy'
          }
        },
        data: 'false',
        arr: ['ble', 'gray', ['woo', true, 'stew'], { gary: 'true' }, false, 'false'],
        rubbish: 'nonsense',
        when: 'true'
      }
    }
    parseQueryBooleans(req, {}, next)
    expect(req.query).to.deep.equal({
      account: {
        type: 'serial',
        client: true,
        reallyNested: {
          val: 'truth',
          dal: true,
          smal: false,
          alreadyfalse: false,
          str: 'stringy'
        }
      },
      data: false,
      arr: ['ble', 'gray', ['woo', true, 'stew'], { gary: true }, false, false],
      rubbish: 'nonsense',
      when: true
    })
  })
})
