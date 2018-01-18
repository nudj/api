const get = require('lodash/get')
const find = require('lodash/find')

const fetchAccountTokens = require('./fetch-account-tokens')
const fetchThread = require('./fetch-thread')

module.exports = async ({ context, conversation }) => {
  const { threadId, person } = conversation
  const { accessToken } = await fetchAccountTokens(context, { id: person })
  const thread = await fetchThread({ threadId, accessToken })

  const subjects = thread.messages.map(data => {
    return get(find(data.payload.headers, { name: 'Subject' }), 'value')
  })
  const subject = subjects[0]
  return subjects.includes(`Re: ${subject}`) ? `Re: ${subject}` : subject
}
