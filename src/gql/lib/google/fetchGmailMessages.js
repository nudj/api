const fetchAccountTokens = require('./fetchAccountTokens')
const formatThreadMessages = require('./formatThreadMessages')
const fetchThread = require('./fetchThread')

module.exports = async ({ context, conversation }) => {
  const { threadId, person } = conversation
  const { accessToken } = await fetchAccountTokens(context, { id: person })

  const thread = await fetchThread({ threadId, accessToken })
  return formatThreadMessages(context, thread.messages)
}
