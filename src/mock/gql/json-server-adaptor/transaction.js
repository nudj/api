const store = require('./store')

module.exports = (action, params) => {
  return action(store(), params)
}
