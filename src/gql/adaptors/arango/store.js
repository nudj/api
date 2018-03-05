const reduce = require('lodash/reduce')
const flatten = require('lodash/flatten')
const omit = require('lodash/omit')
const uniq = require('lodash/uniq')
const pluralize = require('pluralize')

const { merge } = require('@nudj/library')

const { startOfDay, endOfDay } = require('../../lib/format-dates')
const { parseFiltersToAql, createFiltersForFields } = require('../../lib/aql')
const { generateId } = require('../../lib/hash')
const { idTypes } = require('../../lib/hash/constants')

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

  const executeAqlQuery = async (query, params) => {
    const cursor = await db.query(query, params)
    const response = await cursor.all()
    return flatten(response).map(normaliseData)
  }

  const createId = (type, data) => {
    switch (pluralize.singular(type)) {
      case idTypes.PERSON:
        return generateId(idTypes.PERSON, data)
      case idTypes.COMPANY:
        return generateId(idTypes.COMPANY, data)
      case idTypes.ROLE:
        return generateId(idTypes.ROLE, data)
      default:
        return generateId()
    }
  }

  return {
    create: async ({
      type,
      data
    }) => {
      const _key = createId(type, data)
      const response = await db.collection(type).save(Object.assign(data, {
        _key,
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
      try {
        return normaliseData(await db.collection(type)[method](arg))
      } catch (error) {
        if (error.message !== 'no match') throw error
      }
    },
    readMany: async ({
      type,
      ids
    }) => {
      const response = await db.collection(type).lookupByKeys(ids)
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
          from: dateFrom && endOfDay(dateFrom)
        })
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
      let item
      try {
        item = await db.collection(type).firstExample(filters)
      } catch (error) {
        if (error.message !== 'no match') throw error
      }
      if (!item) {
        const _key = createId(type, data)
        const response = await db.collection(type).save(Object.assign(data, {
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
      fieldAliases,
      filters
    }) => {
      const querySegments = uniq([query, ...query.split(' ')])
      const queries = merge(...querySegments.map((subQuery, index) => {
        return { [`query${index}`]: subQuery }
      }))

      const operations = fields.map(fieldGroup => {
        return Object.keys(queries).map(queryName => `(
          ${parseFiltersToAql(filters)}
          ${createFiltersForFields(fieldGroup, queryName, fieldAliases)}
          RETURN item
        )`)
      }).join(',')
      const aqlQuery = `
        FOR item IN ${type}
          FOR element IN UNION([], ${operations})
            COLLECT collected = element WITH COUNT INTO matches
            SORT matches DESC
            RETURN collected
      `

      return executeAqlQuery(aqlQuery, queries)
    },
    countByFilters: async ({
      type,
      filters = {}
    }) => {
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

      const cursor = await db.query(query, {
        to: endOfDay(dateTo),
        from: startOfDay(dateFrom)
      })
      const response = await cursor.all()
      return response[0] || 0
    },
    import: async ({
      data
    }) => {
      const keyedData = data.map(collection => ({
        name: collection.name,
        onDuplicate: collection.onDuplicate || 'ignore',
        data: collection.data.map(item => {
          item._key = item.id
          return omit(item, ['id'])
        })
      }))

      const imports = await Promise.all(keyedData.map(collection => {
        const { name, data, onDuplicate } = collection

        return db.collection(name)
          .import(data.map(entry => {
            return merge(entry, {
              created: newISODate(),
              modified: newISODate()
            })
          }), { onDuplicate, details: true })
      }))

      const results = imports.map((result, index) => {
        if (result.error || result.errors) {
          throw new Error(`Import Error: ${result.details}`)
        }

        const collection = keyedData[index].name
        return merge(result, { collection })
      })

      return results
    }
  }
}
