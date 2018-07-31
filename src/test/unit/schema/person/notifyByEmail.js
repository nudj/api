/* eslint-env mocha */
const proxyquire = require('proxyquire')
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect

chai.use(sinonChai)

describe('Person.notifyByEmail', () => {
  let definition
  let mailerSendStub
  let result

  before(() => {
    mailerSendStub = sinon.stub().returns(Promise.resolve({
      success: true
    }))
    definition = proxyquire('../../../../gql/schema/person/notifyByEmail', {
      '../../lib/mailer': {
        send: mailerSendStub
      }
    })
  })

  beforeEach(async () => {
    result = await definition.resolvers.Person.notifyByEmail({ firstName: 'Tim', email: 'test@test.tld' }, {
      userId: 'person1',
      subject: '{{firstName}}! About that job',
      body: 'Hello, {{firstName}}'
    })
  })

  it('should send email via mailgun', () => {
    expect(mailerSendStub).to.have.been.called()
  })

  it('should send email to correct address', () => {
    expect(mailerSendStub.args[0][0]).to.have.property('to', 'test@test.tld')
  })

  it('should set email subject', () => {
    expect(mailerSendStub.args[0][0]).to.have.property('subject', 'Tim! About that job')
  })

  it('should add firstName to email body', () => {
    expect(mailerSendStub.args[0][0]).to.have.property('html', 'Hello, Tim')
  })

  it('should return sent status', () => {
    expect(result).to.deep.equal({
      success: true
    })
  })
})
