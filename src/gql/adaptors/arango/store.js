const reduce = require('lodash/reduce')
const flatten = require('lodash/flatten')
const omit = require('lodash/omit')
const uniq = require('lodash/uniq')
const isNil = require('lodash/isNil')
const pluralize = require('pluralize')

const { merge } = require('@nudj/library')

const { startOfDay, endOfDay } = require('../../lib/format-dates')
const { parseFiltersToAql, createFiltersForFields } = require('../../lib/aql')
const { generateId } = require('@nudj/library')

module.exports = ({
  db,
  getDataLoader
}) => {
  const normaliseData = (data) => {
    if (isNil(data)) return null
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
    return flatten(response)
  }

  return {
    create: async ({
      type,
      data
    }) => {
      const _key = data._key || generateId(pluralize.singular(type), data)
      const response = await db.collection(type).save(Object.assign(data, {
        _key,
        created: newISODate(),
        modified: newISODate()
      }), { returnNew: true })
      const newResult = response.new
      getDataLoader(type).prime(newResult._key, newResult)
      return normaliseData(newResult)
    },
    readOne: async ({
      type,
      id,
      filters,
      filter
    }) => {
      let result
      filters = filter || filters

      if (!id && !filters) return Promise.resolve(null)
      try {
        const dataLoader = getDataLoader(type)
        if (filters) {
          result = await db.collection(type).firstExample(filters)
          if (result) {
            dataLoader.prime(result._key, result)
          }
          result = normaliseData(result)
        } else {
          result = normaliseData(await dataLoader.load(id))
        }
        return result
      } catch (error) {
        if (error.message !== 'no match') throw error
      }
    },
    readMany: async ({
      type,
      ids
    }) => {
      const dataLoader = getDataLoader(type)
      const response = await Promise.all(ids.map(id => dataLoader.load(id)))
      return response.map(normaliseData)
    },
    readAll: async ({
      type,
      filters,
      filter
    }) => {
      let results
      filters = filter || filters

      if (!filters) {
        results = await db.collection(type).all()
        results = await results.all()
      } else if (filters.dateTo || filters.dateFrom) {
        const { dateTo, dateFrom, ...mainFilters } = filters
        const query = [
          `FOR item in ${type}`,
          parseFiltersToAql(mainFilters),
          dateTo && 'FILTER DATE_TIMESTAMP(item.created) <= DATE_TIMESTAMP(@to)',
          dateFrom && 'FILTER DATE_TIMESTAMP(item.created) >= DATE_TIMESTAMP(@from)',
          'RETURN item'
        ].filter(Boolean).join('\n')

        results = await executeAqlQuery(query, {
          ...mainFilters,
          to: dateTo && endOfDay(dateTo),
          from: dateFrom && endOfDay(dateFrom)
        })
      } else {
        results = await db.collection(type).byExample(filters)
        results = await results.all()
      }
      results.forEach(result => getDataLoader(type).prime(result._key, result))
      return results.map(normaliseData)
    },
    update: async ({
      type,
      id,
      data
    }) => {
      const response = await db.collection(type).update(
        id,
        {
          ...omit(data, ['id']),
          modified: newISODate()
        },
        { returnNew: true }
      )
      const newResult = response.new
      getDataLoader(type).clear(id).prime(id, newResult)
      return normaliseData(newResult)
    },
    delete: async ({
      type,
      id
    }) => {
      const response = await db.collection(type).remove(id, { returnOld: true })
      getDataLoader(type).clear(id)
      return normaliseData(response.old)
    },
    readOneOrCreate: async ({
      type,
      filters,
      filter,
      data
    }) => {
      let result
      filters = filter || filters
      try {
        result = await db.collection(type).firstExample(filters)
      } catch (error) {
        if (error.message !== 'no match') throw error
      }
      if (!result) {
        const _key = generateId(pluralize.singular(type), data)
        const response = await db.collection(type).save(Object.assign(data, {
          _key,
          created: newISODate(),
          modified: newISODate()
        }), { returnNew: true })
        result = response.new
      }
      getDataLoader(type).clear(result._key).prime(result._key, result)
      return normaliseData(result)
    },
    search: async ({
      type,
      query,
      fields,
      fieldAliases,
      filters,
      filter
    }) => {
      filters = filter || filters
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

      const results = await executeAqlQuery(aqlQuery, {
        ...queries,
        ...filters
      })
      results.forEach(result => getDataLoader(type).prime(result._key, result))
      return results.map(normaliseData)
    },
    countByFilters: async ({
      type,
      filters,
      filter
    }) => {
      filters = filter || filters || {}

      const { dateTo, dateFrom, ...mainFilters } = filters
      const query = [
        `RETURN COUNT(`,
        `FOR item IN ${type}`,
        parseFiltersToAql(mainFilters),
        dateTo && 'FILTER DATE_TIMESTAMP(item.created) <= DATE_TIMESTAMP(@to)',
        dateFrom && 'FILTER DATE_TIMESTAMP(item.created) >= DATE_TIMESTAMP(@from)',
        'RETURN item',
        ')'
      ].filter(Boolean).join('\n')

      const cursor = await db.query(query, {
        ...mainFilters,
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
