const store = require('./store')

const baseURL = process.env.DB_API_URL

module.exports = async (action, params) => {
  try {
    return await action(store({ baseURL }), params)
  } catch (error) {
    error.addBoundaryLogs(
      `JsonServerTransaction`,
      baseURL,
      params
    )
  }
}
