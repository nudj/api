const validateTokens = require('./validate-tokens')
const {
  values: emailPreferences
} = require('../../schema/enums/email-preference-types')

module.exports = async (context, person) => {
  let account = await context.sql.readOne({
    type: 'accounts',
    filters: { person: person.id, type: emailPreferences.GOOGLE }
  })
  if (!account) throw new Error('No google account found')

  const accountData = JSON.parse(account.data)
  const { accessToken, refreshToken } = accountData
  const tokens = await validateTokens(accessToken, refreshToken)
  if (tokens.refreshed) {
    const data = JSON.stringify({ accessToken: tokens.accessToken, refreshToken })
    account = await context.sql.update({
      type: 'accounts',
      id: account.id,
      data: { data }
    })
  }
  return JSON.parse(account.data)
}
