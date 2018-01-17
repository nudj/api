const emailParser = require('node-email-reply-parser')
const { parseOneAddress } = require('email-addresses')
const { Base64 } = require('js-base64')
const striptags = require('striptags')
const get = require('lodash/get')
const find = require('lodash/find')

const fetchAccountTokens = require('./fetchAccountTokens')
const fetchThread = require('./fetchThread')

const sanitiseMessage = (message) => {
  // Extracts the email body and formats it with appropriate line breaks.
  const extraGmailInfoSection = /<div\s*class="[^"]*?gmail_extra[^"]*?"\s*>/
  const messageBody = Base64.decode(message)
    .split(extraGmailInfoSection)[0]
    .replace(/<div>/g, '\n')

  return emailParser(striptags(messageBody)).getVisibleText()
}

const fetchPersonFromEmail = async (context, headers, name) => {
  const { address } = parseOneAddress(
    get(
      find(headers, { name }),
      'value'
    )
  )
  return await context.transaction((store, params) => {
    const email = params.address
    return store.readOneOrCreate({
      type: 'people',
      filters: { email },
      data: { email }
    })
    .then(person => person.id)
  }, { address })
}

module.exports = async ({ context, conversation }) => {
  const { threadId, person } = conversation
  const { accessToken } = await fetchAccountTokens(context, { id: person })
  const thread = await fetchThread({ threadId, accessToken })

  return Promise.all(thread.messages.map(async (data) => {
    const { payload, id, internalDate: date } = data
    const from = await fetchPersonFromEmail(context, payload.headers, 'From')
    const to = await fetchPersonFromEmail(context, payload.headers, 'To')

    const encryptedBody = (
      get(payload, 'body.data') ||
      get(payload, 'parts[1].body.data') ||
      get(payload, 'parts[0].body.data')
    )
    const body = sanitiseMessage(encryptedBody) // Emulates Gmail formatting

    return { id, from, to, date, body }
  }))
}
