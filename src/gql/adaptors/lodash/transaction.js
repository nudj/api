const store = require('./store')

module.exports = ({ db }) => (action, params) => {
  return action(store({ db }), params)
}
