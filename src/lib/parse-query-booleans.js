const mapValues = require('lodash/mapValues')

const booleanParser = (obj) => {
  if (obj === 'true') return true
  if (obj === 'false') return false
  if (obj.constructor === Object) return mapValues(obj, booleanParser)
  if (Array.isArray(obj)) return obj.map(value => booleanParser(value))
  return obj
}

module.exports = (req, res, next) => {
  req.query = mapValues(req.query, booleanParser)
  next()
}
