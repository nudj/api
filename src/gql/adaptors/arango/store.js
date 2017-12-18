module.exports = () => {
  const reduce = require('lodash/reduce')
  const db = require('@arangodb').db
  const normaliseData = (data) => {
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

  return {
    create: ({
      type,
      data
    }) => {
      const response = db[type].save(Object.assign(data, {
        created: newISODate(),
        modified: newISODate()
      }), { returnNew: true })
      return Promise.resolve(normaliseData(response.new))
    },
    readOne: ({
      type,
      id,
      filters
    }) => {
      let method = 'document'
      let arg = id
      if (filters) {
        method = 'firstExample'
        arg = filters
      }
      return Promise.resolve(normaliseData(db[type][method](arg)))
    },
    readMany: ({
      type,
      ids
    }) => {
      return Promise.resolve(db[type].document(ids).map(normaliseData))
    },
    readAll: ({
      type,
      filters
    }) => {
      if (filters) {
        return Promise.resolve(db[type].byExample(filters).toArray().map(normaliseData))
      }
      return Promise.resolve(db[type].all().toArray().map(normaliseData))
    },
    update: ({
      type,
      id,
      data
    }) => {
      const response = db[type].update(id, Object.assign(data, {
        modified: newISODate()
      }), { returnNew: true })
      return Promise.resolve(normaliseData(response.new))
    },
    delete: ({
      type,
      id
    }) => {
      const response = db[type].remove(id, { returnOld: true })
      return Promise.resolve(normaliseData(response.old))
    },
    readOneOrCreate: ({
      type,
      filters,
      data
    }) => {
      let item = db[type].firstExample(filters)
      if (!item) {
        const response = db[type].save(Object.assign(data, {
          created: newISODate(),
          modified: newISODate()
        }), { returnNew: true })
        item = response.new
      }
      return Promise.resolve(normaliseData(item))
    },
    search: ({
      type,
      query,
      fields
    }) => {
      const operations = fields.map(field => `
        (
          FOR item IN ${type}
            FILTER CONTAINS(LOWER(item.${field}), LOWER("${query}"))
            RETURN item
        )
      `).join(',')
      return Promise.resolve(
        db
          ._query(`RETURN UNION_DISTINCT(${operations})`)
          .toArray()
          .map(normaliseData)
      )
    }
  }
}
