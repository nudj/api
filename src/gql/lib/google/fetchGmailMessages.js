const emailParser = require('node-email-reply-parser')
const { parseOneAddress } = require('email-addresses')
const { Base64 } = require('js-base64')
const striptags = require('striptags')
const get = require('lodash/get')
const find = require('lodash/find')

const fetchAccountTokens = require('./fetchAccountTokens')
const fetchThread = require('./fetchThread')

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
  }, { address })
}

module.exports = async ({ context, conversation }) => {
  const { threadId, person } = conversation
  const { accessToken } = await fetchAccountTokens(context, { id: person })
  const thread = await fetchThread({ threadId, accessToken })

  return Promise.all(thread.messages.map(async (data) => {
    const { payload, id, internalDate: date } = data
    const sender = await fetchPersonFromEmail(context, payload.headers, 'From')
    const recipient = await fetchPersonFromEmail(context, payload.headers, 'To')

    const encryptedBody =
      get(payload, 'body.data') || get(payload, 'parts[0].body.data')
    const message = emailParser(Base64.decode(encryptedBody)).getVisibleText()
    const body = striptags(message.replace(/<br>|<br\s*\/>/g, '\n'))

    return { id, sender, recipient, date, body }
  }))
}