const fetchAccountTokens = require('./fetchAccountTokens')
const fetchThreadId = require('./fetchThreadId')
const send = require('./send')

module.exports = async ({ context, email, person }) => {
  const { accessToken } = await fetchAccountTokens(context, person)
  const existingConversation = await fetchThreadId(context, person, email.to)

  if (existingConversation) {
    const { threadId } = existingConversation
    return await send({ email, accessToken, threadId })
  }
  return await send({ email, accessToken })
}
