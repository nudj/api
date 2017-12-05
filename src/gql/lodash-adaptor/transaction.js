const store = require('./store')

module.exports = ({ data }) => (action, params) => {
  return action(store({ data }), params)
}
