const store = require('./store')

const baseURL = process.env.DB_API_URL

module.exports = (action, params) => {
  return action(store({ baseURL }), params)
}
