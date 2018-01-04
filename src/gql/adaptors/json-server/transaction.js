const store = require('./store')
const { logThenThrow } = require('@nudj/library/errors')

const baseURL = process.env.DB_API_URL

module.exports = async (action, params) => {
  try {
    return await action(store({ baseURL }), params)
  } catch (error) {
    logThenThrow(error, `JsonServerTransaction`, baseURL, params)
  }
}
