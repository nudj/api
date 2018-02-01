const { decodeHTML } = require('entities')
const { parseOneAddress } = require('email-addresses')
const { Base64 } = require('js-base64')
const striptags = require('striptags')
const get = require('lodash/get')
const find = require('lodash/find')

const fetchAccountTokens = require('./fetch-account-tokens')
const fetchThread = require('./fetch-thread')
const gmailBodyRegex = require('./gmail-body-regex')

const sanitiseMessage = (message) => {
  // Extracts the email body and formats it with appropriate line breaks.
  const messageBody = Base64.decode(message)
    .replace(/\n/g, '')
    .split(gmailBodyRegex)[0]
    .replace(/<div>/g, '\n')

  return decodeHTML(striptags(messageBody)) // Remove tags & replace HTML entities
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
    const { payload, id, internalDate } = data
    const from = await fetchPersonFromEmail(context, payload.headers, 'From')
    const to = await fetchPersonFromEmail(context, payload.headers, 'To')
    const date = parseInt(internalDate, 10)

    const encryptedBody = (
      get(payload, 'body.data') ||
      get(payload, 'parts[1].body.data') ||
      get(payload, 'parts[0].body.data')
    )
    const body = sanitiseMessage(encryptedBody)

    return { id, from, to, date, body }
  }))
}
