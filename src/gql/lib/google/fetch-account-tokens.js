const validateTokens = require('./validate-tokens')
const {
  values: emailPreferences
} = require('../../schema/enums/email-preference-types')

module.exports = async (context, person) => {
  let account = await context.store.readOne({
    type: 'accounts',
    filters: { person: person.id, type: emailPreferences.GOOGLE }
  })
  if (!account) throw new Error('No google account found')

  const { accessToken, refreshToken } = account.data
  const tokens = await validateTokens(accessToken, refreshToken)
  if (tokens.refreshed) {
    const data = { accessToken: tokens.accessToken, refreshToken }
    account = await context.store.update({
      type: 'accounts',
      id: account.id,
      data: { data }
    })
  }
  return account.data
}
