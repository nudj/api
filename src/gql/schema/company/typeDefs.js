const { typeDef: all } = require('./all')
const properties = require('./properties')
const { typeDef: hirers } = require('./properties/hirers')

module.exports = [
  all,
  properties,
  hirers
]
