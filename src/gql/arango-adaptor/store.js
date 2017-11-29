const reduce = require('lodash/reduce')

function normaliseData (data) {
  return reduce(data, (result, value, key) => {
    switch (key) {
      case '_key':
        result.id = value
        break
      case '_id':
      case '_rev':
        break
      default:
        result[key] = value
    }
    return result
  }, {})
}
const newISODate = () => (new Date()).toISOString()

module.exports = {
  create: ({
    type,
    data
  }) => {
    const db = require('@arangodb').db
    const response = db[type].save(Object.assign(data, {
      created: newISODate(),
      modified: newISODate()
    }), { returnNew: true })
    return normaliseData(response.new)
  },
  readOne: ({
    type,
    id,
    filters
  }) => {
    const db = require('@arangodb').db
    let method = 'document'
    let arg = id
    if (filters) {
      method = 'firstExample'
      arg = filters
    }
    return normaliseData(db[type][method](arg))
  },
  readMany: ({
    type,
    ids
  }) => {
    const db = require('@arangodb').db
    return db[type].document(ids).map(normaliseData)
  },
  readAll: ({
    type,
    filters
  }) => {
    const db = require('@arangodb').db
    if (filters) {
      return db[type].byExample(filters).toArray().map(normaliseData)
    } else {
      return db[type].all().toArray().map(normaliseData)
    }
  }
}
