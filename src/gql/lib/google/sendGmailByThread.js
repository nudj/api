const get = require('lodash/get')
const fetchGmailSubject = require('./fetchGmailSubject')
const sendGmail = require('./sendGmail')

const fetchPerson = async (context, personId) => {
  return await context.transaction((store, params) => {
    const { id } = params
    return store.readOne({
      type: 'people',
      id
    })
    .then(person => {
      if (!person) throw new Error('Person in converation not found')
      return person
    })
  }, { id: personId })
}

module.exports = async ({ context, body, conversation }) => {
  const { threadId, recipient, person: sender } = conversation
  const { email: to } = await fetchPerson(context, recipient)
  const person = await fetchPerson(context, sender)
  const subject = await fetchGmailSubject({ context, conversation })
  const from = `${get(person, 'firstName', '')} ${get(person, 'lastName', '')} <${person.email}>`
  const email = { body, to, from, subject }

  return await sendGmail({ context, email, person, threadId })
}
