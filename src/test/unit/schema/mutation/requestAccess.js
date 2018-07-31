/* eslint-env mocha */
const proxyquire = require('proxyquire')
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect

chai.use(sinonChai)

describe('Mutation.requestAccess', () => {
  let definition
  let mailerSendStub
  let result

  before(() => {
    mailerSendStub = sinon.stub().returns(Promise.resolve({
      success: true
    }))
    definition = proxyquire('../../../../gql/schema/mutation/requestAccess', {
      '../../lib/mailer': {
        sendInternalEmail: mailerSendStub
      },
      '../../lib/intercom': {
        createUniqueLeadAndTag: () => {}
      }
    })
  })

  beforeEach(async () => {
    result = await definition.resolvers.Mutation.requestAccess(null, {
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob@johnson.com',
      company: 'BJ Ltd'
    })
  })

  it('should send email via mailer lib', () => {
    expect(mailerSendStub).to.have.been.called()
  })

  it('should set email subject', () => {
    expect(mailerSendStub.args[0][0]).to.have.property('subject', 'Request Access')
  })

  it('should add full name to email body', () => {
    expect(mailerSendStub.args[0][0]).to.have.property('html').to.contain('Bob Johnson')
  })

  it('should add email address to email body', () => {
    expect(mailerSendStub.args[0][0]).to.have.property('html').to.contain('bob@johnson.com')
  })

  it('should add company to email body', () => {
    expect(mailerSendStub.args[0][0]).to.have.property('html').to.contain('BJ Ltd')
  })

  it('should return sent status', () => {
    expect(result).to.deep.equal({
      success: true
    })
  })
})
