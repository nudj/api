const reduce = require('lodash/reduce')
const flatten = require('lodash/flatten')
const omit = require('lodash/omit')

module.exports = ({ db }) => {
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

  const executeAqlQuery = async (query, params) => {
    const response = await db.query(query, params)
    return flatten(response.map(normaliseData))
  }

  return {
    create: async ({
      type,
      data
    }) => {
      const response = await db.collection(type).save(Object.assign(data, {
        created: newISODate(),
        modified: newISODate()
      }), { returnNew: true })
      return normaliseData(response.new)
    },
    readOne: async ({
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
      return normaliseData(await db.collection(type)[method](arg))
    },
    readMany: async ({
      type,
      ids
    }) => {
      const response = await db.collection(type).document(ids)
      return response.map(normaliseData)
    },
    readAll: async ({
      type,
      filters
    }) => {
      if (!filters) {
        const response = await db.collection(type).all()
        return response.map(normaliseData)
      }
      if (filters.dateTo || filters.dateFrom) {
        const { dateTo: to, dateFrom: from } = filters
        const generalFilters = parseFiltersToAql(omit(filters, ['dateTo', 'dateFrom']))
        const query = [
          `FOR item in ${type}`,
          generalFilters,
          to && 'FILTER DATE_TIMESTAMP(item.created) <= DATE_TIMESTAMP(@to)',
          from && 'FILTER DATE_TIMESTAMP(item.created) >= DATE_TIMESTAMP(@from)',
          'RETURN item'
        ].filter(Boolean).join('\n')

        return executeAqlQuery(query, { to, from })
      } else {
        const response = await db.collection(type).byExample(filters)
        return response.map(normaliseData)
      }
    },
    update: async ({
      type,
      id,
      data
    }) => {
      const response = await db.collection(type).update(id, Object.assign(data, {
        modified: newISODate()
      }), { returnNew: true })
      return Promise.resolve(normaliseData(response.new))
    },
    delete: async ({
      type,
      id
    }) => {
      const response = await db.collection(type).remove(id, { returnOld: true })
      return Promise.resolve(normaliseData(response.old))
    },
    readOneOrCreate: async ({
      type,
      filters,
      data
    }) => {
      let item = await db.collection(type).firstExample(filters)
      if (!item) {
        const response = await db.collection(type).save(Object.assign(data, {
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
      const aqlQuery = `RETURN UNION_DISTINCT([],${operations})`
      return executeAqlQuery(aqlQuery, { query })
    },
    countByFilters: ({
      type,
      filters = {}
    }) => {
      const { dateTo: to, dateFrom: from } = filters
      const generalFilters = parseFiltersToAql(omit(filters, ['dateTo', 'dateFrom']))
      const query = [
        `RETURN COUNT(`,
        `FOR item IN ${type}`,
        generalFilters,
        to && 'FILTER DATE_TIMESTAMP(item.created) <= DATE_TIMESTAMP(@to)',
        from && 'FILTER DATE_TIMESTAMP(item.created) >= DATE_TIMESTAMP(@from)',
        'RETURN item',
        ')'
      ].filter(Boolean).join('\n')

      return Promise.resolve(flatten(
        db._query(query, { to, from }).toArray()
      )).then(response => response[0])
    }
  }
}
