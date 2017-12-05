const store = require('./store')

module.exports = (action, params) => action(store(), params)
