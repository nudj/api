const { Base64 } = require('js-base64')
const { parseOneAddress } = require('email-addresses')
const emailParser = require('node-email-reply-parser')
const striptags = require('striptags')
const get = require('lodash/get')
const find = require('lodash/find')

const { getFirstNonNil } = require('@nudj/library')

const fetchPersonFromEmail = async (context, headers, name) => {
  const { address } = parseOneAddress(get(find(headers, { name }), 'value'))
  return await context.transaction((store, params) => {
    const email = params.address
    return store.readOneOrCreate({
      type: 'people',
      filters: { email },
      data: { email }
    })
  }, { address })
}

module.exports = (context, messages) => {
  return messages.map(async (data) => {
    const { payload, id, internalDate: date } = data
    const sender = await fetchPersonFromEmail(context, payload.headers, 'From')
    const recipient = await fetchPersonFromEmail(context, payload.headers, 'To')

    const encryptedBody = getFirstNonNil(
      get(payload, 'body.data'),
      get(payload, 'parts[0].body.data')
    )
    const message = emailParser(Base64.decode(encryptedBody)).getVisibleText()
    const body = striptags(message.replace(/<br>|<br\s*\/>/g, '\n'))

    return { id, sender, recipient, date, body }
  })
}
