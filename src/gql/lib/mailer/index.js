const Mailgun = require('mailgun-js')
const randomWords = require('random-words')
const camelCase = require('lodash/camelCase')
const { logger } = require('@nudj/library')

const {
  INTERNAL_EMAIL_ADDRESS,
  INTERNAL_EMAIL_FROM
} = require('../constants')

const teammateInvitationEmailBodyTemplate = require('./invite-email-template')
const requestAccessEmailTemplate = require('./request-access-email-template')
const sendJobsEmailBodyTemplate = require('./send-jobs-email-template')
const jobNotificationEmailBodyTemplate = require('./job-notification-email-template')
const requestAcceptedEmailBodyTemplate = require('./request-accepted-email-template')
const newApplicationEmailBodyTemplate = require('./new-application-email-template')
const newIntroEmailBodyTemplate = require('./new-intro-email-template')
const referralLinkEmailBodyTemplate = require('./referral-link-email-template')

const mailgun = Mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
})

const fromViaNudj = name => `${name} via ${INTERNAL_EMAIL_FROM}`

module.exports = {
  send: ({
    from = INTERNAL_EMAIL_FROM,
    to, subject, html
  }) => {
    const id = camelCase(randomWords(2).join('-'))
    logger('info', 'Sending email', id, from, '>', to, subject)
    return mailgun
      .messages()
      .send({ from, to, subject, html })
      .then(reply => {
        logger('info', 'Mailer response', id, from, '>', to, subject, reply)
        return {
          success: true
        }
      })
  },
  sendInternalEmail: ({ subject, html }) => {
    return mailgun
      .messages()
      .send({
        from: INTERNAL_EMAIL_FROM,
        to: INTERNAL_EMAIL_ADDRESS,
        subject,
        html
      })
  },
  sendAccessRequestEmail: ({
    to,
    requestee,
    requestSlug,
    company,
    hire
  }) => {
    return mailgun
      .messages()
      .send({
        from: INTERNAL_EMAIL_FROM,
        to,
        subject: 'A user has requested access on nudj',
        html: requestAccessEmailTemplate({
          requestee,
          requestSlug,
          company,
          hire
        })
      })
  },
  sendNewApplicationEmail: ({
    to,
    hire,
    job,
    person
  }) => {
    return mailgun
      .messages()
      .send({
        from: INTERNAL_EMAIL_FROM,
        to,
        subject: 'You\'ve had a new application on nudj',
        html: newApplicationEmailBodyTemplate({
          hire,
          job,
          person
        })
      })
  },
  sendNewIntroEmail: ({
    to,
    hire,
    job,
    person
  }) => {
    return mailgun
      .messages()
      .send({
        from: INTERNAL_EMAIL_FROM,
        to,
        subject: 'You\'ve received a new intro on nudj',
        html: newIntroEmailBodyTemplate({
          hire,
          job,
          person
        })
      })
  },
  sendReferralLinkEmailBodyTemplate: ({
    to,
    web,
    person,
    company,
    job,
    referral
  }) => {
    return mailgun
      .messages()
      .send({
        from: INTERNAL_EMAIL_FROM,
        to,
        subject: 'Your unique nudj referral link',
        html: referralLinkEmailBodyTemplate({
          web,
          person,
          company,
          job,
          referral
        })
      })
  },
  sendJobsEmailBodyTemplate,
  teammateInvitationEmailBodyTemplate,
  jobNotificationEmailBodyTemplate,
  requestAcceptedEmailBodyTemplate,
  fromViaNudj
}
