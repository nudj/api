const Mailgun = require('mailgun-js')
const randomWords = require('random-words')
const camelCase = require('lodash/camelCase')
const { logger } = require('@nudj/library')

const { INTERNAL_EMAIL_ADDRESS } = require('../constants')

const teammateInvitationEmailBodyTemplate = require('./invite-email-template')
const sendJobsEmailBodyTemplate = require('./send-jobs-email-template')

const mailgun = Mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
})
module.exports = {
  send: ({ from, to, subject, html }) => {
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
        from: INTERNAL_EMAIL_ADDRESS,
        to: INTERNAL_EMAIL_ADDRESS,
        subject,
        html
      })
  },
  sendJobsEmailBodyTemplate,
  teammateInvitationEmailBodyTemplate
}
