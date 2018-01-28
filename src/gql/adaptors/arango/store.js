module.exports = () => {
  const reduce = require('lodash/reduce')
  const flatten = require('lodash/flatten')
  const { db } = require('@arangodb')

  const normaliseData = (data) => {
    if (data === null) return null
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

  const parseFiltersToAql = (filters = {}) => {
    const keys = Object.keys(filters)
    if (!keys.length) return ''
    return `FILTER ${keys.map((key) => {
      return `item.${key} == "${filters[key]}"`
    }).join(' && ')}`
  }

  const aqlDateComparison = (operator, date) => {
    if (!date) return 'item'
    return `DATE_TIMESTAMP(item.created) ${operator} DATE_TIMESTAMP("${date}")`
  }

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
      if (!id && !filters) return Promise.resolve(null)
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
      filters,
      date
    }) => {
      if (filters) {
        if (date && (date.to || date.from)) {
          const filter = parseFiltersToAql(filters)
          const dateFilters = `
            ${aqlDateComparison('<=', date.to)} && ${aqlDateComparison('>=', date.from)}
          `
          return Promise.resolve(
            flatten(
              db
                ._query(`
                  FOR item in ${type}
                    ${filter}
                    FILTER ${dateFilters}
                    RETURN item
                `)
                .toArray()
            )
          ).then(response => response.map(normaliseData))
        } else {
          return Promise.resolve(db[type].byExample(filters).toArray().map(normaliseData))
        }
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
      fields,
      filters
    }) => {
      const filter = parseFiltersToAql(filters)
      const operations = fields.map(fieldGroup => `
        (
          FOR item IN ${type}
            ${filter}
            FILTER(
              CONTAINS(
                LOWER(CONCAT_SEPARATOR(" ", ${fieldGroup.map(
                  field => `item.${field}`
                )})), LOWER(@query)
              )
            )
            RETURN item
        )
      `).join(',')
      return Promise.resolve(
        flatten(
          db
            ._query(`RETURN UNION_DISTINCT([],${operations})`, { query })
            .toArray()
        )
      ).then(response => response.map(normaliseData))
    }
  }
}
