const validateTokens = require('./validate-tokens')
const { values: emailPreferences } = require('../../schema/enums/email-preference-types')

module.exports = async (context, person) => {
  let account = await context.transaction((store, params) => {
    const { person } = params
    return store.readOne({
      type: 'accounts',
      filters: { person, type: emailPreferences.GOOGLE }
    })
  }, {
    person: person.id
  })
  if (!account) throw new Error('No google account found')
  const { accessToken, refreshToken } = account.data
  const tokens = await validateTokens(accessToken, refreshToken)
  if (tokens.refreshed) {
    const data = { accessToken: tokens.accessToken, refreshToken }
    account = await context.transaction((store, params) => {
      const { account, data } = params
      return store.update({
        type: 'accounts',
        id: account.id,
        data: { data }
      })
    }, { account, data })
  }
  return account.data
}