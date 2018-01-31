const get = require('lodash/get')
const fetchGmailSubject = require('./fetch-gmail-subject')
const sendGmail = require('./send-gmail')
const fetchPerson = require('../helpers/fetch-person')

module.exports = async ({ context, body, conversation }) => {
  const { threadId, recipient, person: sender } = conversation
  const { email: to } = await fetchPerson(context, recipient)
  const person = await fetchPerson(context, sender)
  const subject = await fetchGmailSubject({ context, conversation })
  const from = `${get(person, 'firstName', '')} ${get(person, 'lastName', '')} <${person.email}>`
  const email = { body, to, from, subject }
  return await sendGmail({ context, email, person, threadId })
}
