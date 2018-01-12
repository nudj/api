const fetchAccountTokens = require('./fetchAccountTokens')
const send = require('./send')

module.exports = async ({ context, email, person }) => {
  const { accessToken } = await fetchAccountTokens(context, person)
  return await send({ email, accessToken })
}
