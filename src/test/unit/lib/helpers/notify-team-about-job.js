/* eslint-env mocha */
const { expect } = require('chai')
const sinon = require('sinon')
const nock = require('nock')
const qs = require('qs')
const proxyquire = require('proxyquire')

const mailer = require('../../../../gql/lib/mailer')

const JOB_NOTIFICATION_TEMPLATE = 'JOB_NOTIFICATION_TEMPLATE'
const readAllStub = sinon.stub()
const readManyStub = sinon.stub()
const mailerSendStub = sinon.stub()
const mailerStub = {
  send: mailer.send,
  jobNotificationEmailBodyTemplate: sinon.stub().returns(JOB_NOTIFICATION_TEMPLATE)
}
const context = {
  userId: 'person1',
  store: {
    readAll: readAllStub,
    readMany: readManyStub
  }
}
const company = {
  id: 'company1',
  name: 'Company One'
}
const job = {}
const person = {
  id: 'person2',
  email: 'nick@nudj.co',
  firstName: 'Nick'
}

const notifyTeamAboutJob = proxyquire('../../../../gql/lib/helpers/notify-team-about-job', {
  '../../lib/mailer': mailerStub
})

describe('notifyTeamAboutJob', () => {
  beforeEach(() => {
    nock('https://api.mailgun.net')
      .persist()
      .filteringRequestBody(body => {
        mailerSendStub(qs.parse(body))
        return true
      })
      .post(() => true)
      .reply(200, 'OK')
    readAllStub.reset()
    readManyStub.reset()
    mailerSendStub.reset()
    mailerStub.jobNotificationEmailBodyTemplate.reset()
  })
  afterEach(() => {
    nock.cleanAll()
  })

  describe('when hirer has team mates', () => {
    beforeEach(() => {
      readAllStub.returns([
        {
          id: 'hirer1',
          person: 'person1'
        },
        {
          id: 'hirer2',
          person: 'person2'
        }
      ])
      readManyStub.returns([
        person
      ])
    })

    it('should fetch the company hirers', async () => {
      await notifyTeamAboutJob(context, company, job)
      expect(readAllStub).to.have.been.calledWith({
        type: 'hirers',
        filters: {
          company: 'company1',
          onboarded: true
        }
      })
    })

    it('should fetch the person for each team mate', async () => {
      await notifyTeamAboutJob(context, company, job)
      expect(readManyStub).to.have.been.calledWith({
        type: 'people',
        ids: ['person2']
      })
    })

    it('should pass the required data to the email templating function', async () => {
      await notifyTeamAboutJob(context, company, job)
      expect(mailerStub.jobNotificationEmailBodyTemplate).to.have.been.calledWith({
        person,
        company,
        job
      })
    })

    it('sends emails for each team mate', async () => {
      await notifyTeamAboutJob(context, company, job)

      const firstCallArgs = mailerSendStub.getCall(0).args[0]
      expect(firstCallArgs).to.have.property('to', 'nick@nudj.co')
      expect(firstCallArgs).to.have.property('subject', 'New jobs on nudj!')
      expect(firstCallArgs).to.have.property('html', JOB_NOTIFICATION_TEMPLATE)
    })
  })

  describe('when hirer has no team mates', () => {
    beforeEach(() => {
      readAllStub.returns([
        {
          id: 'hirer1',
          person: 'person1'
        }
      ])
    })

    it('should fetch the company hirers', async () => {
      await notifyTeamAboutJob(context, company, job)
      expect(readAllStub).to.have.been.calledWith({
        type: 'hirers',
        filters: {
          company: 'company1',
          onboarded: true
        }
      })
    })

    it('should not send any emails', async () => {
      await notifyTeamAboutJob(context, company, job)
      expect(mailerSendStub).to.not.have.been.called()
    })
  })
})
