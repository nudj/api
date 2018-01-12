const validateTokens = require('./validateTokens')

module.exports = async (context, person) => {
  let account = await context.transaction((store, params) => {
    const { person } = params
    return store.readOne({
      type: 'accounts',
      filters: { person }
    })
  }, {
    person: person.id
  })
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
