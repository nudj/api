/* eslint-env mocha */
const proxyquire = require('proxyquire')
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect

chai.use(sinonChai)

describe('Mutation.signUp', () => {
  let definition
  let mailerSendStub

  before(() => {
    mailerSendStub = sinon.stub().returns(Promise.resolve({
      success: true
    }))
    definition = proxyquire('../../../../gql/schema/mutation/signUp', {
      '../../lib/mailer': {
        sendInternalEmail: mailerSendStub
      },
      '../../lib/intercom': {
        createUniqueLeadAndTag: () => {}
      }
    })
  })

  describe('when green path', () => {
    let result

    beforeEach(async () => {
      result = await definition.resolvers.Mutation.signUp(null, {
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob@johnson.com',
        title: 'Head of Bob',
        role: 'Bobbing'
      })
    })

    it('should send email via mailgun', () => {
      expect(mailerSendStub).to.have.been.called()
    })

    it('should set email subject', () => {
      expect(mailerSendStub.args[0][0]).to.have.property('subject', 'Sign-up for Updates')
    })

    it('should add full name to email body', () => {
      expect(mailerSendStub.args[0][0]).to.have.property('html').to.contain('Bob Johnson')
    })

    it('should add email address to email body', () => {
      expect(mailerSendStub.args[0][0]).to.have.property('html').to.contain('bob@johnson.com')
    })

    it('should add job title to email body', () => {
      expect(mailerSendStub.args[0][0]).to.have.property('html').to.contain('Head of Bob')
    })

    it('should add role(s) to email body', () => {
      expect(mailerSendStub.args[0][0]).to.have.property('html').to.contain('Bobbing')
    })

    it('should return sent status', () => {
      expect(result).to.deep.equal({
        success: true
      })
    })
  })
})
