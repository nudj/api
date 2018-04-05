module.exports = () => {
  const reduce = require('lodash/reduce')
  const flatten = require('lodash/flatten')
  const omit = require('lodash/omit')
  const { db } = require('@arangodb')
  const arangoCrypto = require('@arangodb/crypto')

  const crypto = loadArangoCryptoAdaptor(arangoCrypto)
  const generateId = loadIdGenerator(crypto)

  const startOfDay = timestamp => {
    if (!timestamp) return

    const validDate = (new Date(timestamp)).getTime() > 0
    if (!validDate) throw new Error('Invalid timestamp')
    return `${timestamp.split('T')[0]}T00:00:00.000Z`
  }

  const endOfDay = timestamp => {
    if (!timestamp) return

    const validDate = (new Date(timestamp)).getTime() > 0
    if (!validDate) throw new Error('Invalid timestamp')
    return `${timestamp.split('T')[0]}T23:59:59.999Z`
  }

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

  const executeAqlQuery = (query, params) => {
    return Promise.resolve(
      flatten(
        db._query(query, params).toArray()
      )
    ).then(response => response.map(normaliseData))
  }

  const fetchIdType = (type) => {
    const specialTypes = {
      companies: 'company',
      people: 'person',
      roles: 'role',
      connections: 'connection'
    }
    return specialTypes[type]
  }

  return {
    create: ({
      type,
      data
    }) => {
      const _key = generateId(fetchIdType(type), data)
      const response = db[type].save(Object.assign(data, {
        _key,
        created: newISODate(),
        modified: newISODate()
      }), { returnNew: true })
      return Promise.resolve(normaliseData(response.new))
    },
    readOne: ({
      type,
      id,
      filters,
      filter
    }) => {
      filters = filter || filters
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
      filter
    }) => {
      filters = filter || filters
      if (!filters) return Promise.resolve(db[type].all().toArray().map(normaliseData))
      if (filters.dateTo || filters.dateFrom) {
        const { dateTo, dateFrom } = filters
        const generalFilters = parseFiltersToAql(omit(filters, ['dateTo', 'dateFrom']))
        const query = [
          `FOR item in ${type}`,
          generalFilters,
          dateTo && 'FILTER DATE_TIMESTAMP(item.created) <= DATE_TIMESTAMP(@to)',
          dateFrom && 'FILTER DATE_TIMESTAMP(item.created) >= DATE_TIMESTAMP(@from)',
          'RETURN item'
        ].filter(Boolean).join('\n')

        return executeAqlQuery(query, {
          to: dateTo && endOfDay(dateTo),
          from: dateFrom && startOfDay(dateFrom)
        })
      } else {
        return Promise.resolve(db[type].byExample(filters).toArray().map(normaliseData))
      }
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
      filter,
      data
    }) => {
      filters = filter || filters
      let item = db[type].firstExample(filters)
      if (!item) {
        const _key = generateId(fetchIdType(type), data)
        const response = db[type].save(Object.assign(data, {
          _key,
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
      filters,
      filter
    }) => {
      throw new Error('Search cannot be performed as a transaction')
    },
    countByFilters: ({
      type,
      filters,
      filter
    }) => {
      filters = filter || filters || {}
      const { dateTo, dateFrom } = filters
      const generalFilters = parseFiltersToAql(omit(filters, ['dateTo', 'dateFrom']))
      const query = [
        `RETURN COUNT(`,
        `FOR item IN ${type}`,
        generalFilters,
        dateTo && 'FILTER DATE_TIMESTAMP(item.created) <= DATE_TIMESTAMP(@to)',
        dateFrom && 'FILTER DATE_TIMESTAMP(item.created) >= DATE_TIMESTAMP(@from)',
        'RETURN item',
        ')'
      ].filter(Boolean).join('\n')

      return Promise.resolve(flatten(
        db._query(query, {
          to: dateTo && endOfDay(dateTo),
          from: dateFrom && startOfDay(dateFrom)
        }).toArray()
      )).then(response => response[0] || 0)
    }
  }
}
