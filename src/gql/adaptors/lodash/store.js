const get = require('lodash/get')
const filter = require('lodash/filter')
const first = require('lodash/first')
const find = require('lodash/find')
const omit = require('lodash/omit')
const flatten = require('lodash/flatten')
const findIndex = require('lodash/findIndex')
const toLower = require('lodash/toLower')
const merge = require('lodash/merge')
const pluralize = require('pluralize')
const { NotFound } = require('@nudj/library/errors')

const { startOfDay, endOfDay } = require('../../lib/format-dates')

function generateId ({ db, type }) {
  return `${pluralize.singular(type)}${db[type].length + 1}`
}

module.exports = ({ db }) => {
  return {
    create: ({
      type,
      data
    }) => {
      const id = generateId({ db, type })
      const entity = merge(data, { id })
      db[type].push(entity)
      return Promise.resolve({ ...entity })
    },
    readOne: ({
      type,
      id,
      filters
    }) => {
      return new Promise((resolve, reject) => {
        if (!id && !filters) return resolve(null)
        const all = get(db, type)
        let item
        if (filters) {
          item = first(filter(all, filters))
        } else {
          item = find(all, { id })
        }
        if (!item) {
          return resolve(null)
        }
        return resolve({ ...item })
      })
    },
    readAll: ({
      type,
      filters
    }) => {
      const all = get(db, type)
      if (filters) {
        if (filters.dateTo || filters.dateFrom) {
          const { dateTo, dateFrom } = filters
          const time = (stamp) => new Date(stamp).getTime()
          const filtered = filter(all, omit(filters, ['dateTo', 'dateFrom']))
          return Promise.resolve(filter(filtered, (item) => {
            const { created } = item
            if (dateTo && dateFrom) {
              return time(created) <= time(endOfDay(dateTo)) && time(created) >= time(startOfDay(dateFrom))
            }
            if (dateTo) return time(created) <= time(endOfDay(dateTo))
            return time(created) >= time(startOfDay(dateFrom))
          }))
        }
        return Promise.resolve(filter(all, filters))
      }
      return Promise.resolve(all.map(item => ({ ...item })))
    },
    readMany: ({
      type,
      ids
    }) => {
      const all = get(db, type)
      return Promise.all(ids.map(id => {
        const item = find(all, { id })
        if (!item) return Promise.reject(new NotFound(`${type} with id ${id} not found`))
        return { ...item }
      }))
        .catch(() => {
          return []
        })
    },
    update: ({
      type,
      id,
      data
    }) => {
      return new Promise((resolve, reject) => {
        const all = get(db, type)
        const entity = find(all, { id })
        if (!entity) return reject(new NotFound(`${type} with id ${id} not found`))
        Object.assign(entity, data)
        resolve({ ...entity })
      })
    },
    delete: ({
      type,
      id
    }) => {
      return new Promise((resolve, reject) => {
        const all = get(db, type)
        const index = findIndex(all, { id })
        if (index < 0) return reject(new NotFound(`${type} with id ${id} not found`))
        resolve(first(all.splice(index, 1)))
      })
    },
    readOneOrCreate: ({
      type,
      data,
      filters
    }) => {
      const all = get(db, type)
      let entity = find(all, filters)
      if (entity) {
        return Promise.resolve({ ...entity })
      }
      const id = generateId({ db, type })
      entity = merge(data, { id })
      db[type].push(entity)
      return Promise.resolve({ ...entity })
    },
    search: ({
      type,
      query,
      fields,
      filters = {}
    }) => {
      const all = get(db, type)
      const filteredSearch = filter(all, filters)
      query = toLower(query)
      const entity = fields.map(fieldGroup => {
        return filter(filteredSearch, (obj) => {
          const field = fieldGroup.map(field => obj[field]).join(' ')
          return toLower(field).includes(query)
        })
      })
      return Promise.resolve(flatten(entity))
    },
    countByFilters: ({
      type,
      filters = {}
    }) => {
      const all = get(db, type)
      if (filters) {
        if (filters.dateTo || filters.dateFrom) {
          const { dateTo, dateFrom } = filters
          const time = (stamp) => new Date(stamp).getTime()
          const filtered = filter(all, omit(filters, ['dateTo', 'dateFrom']))
          const response = filter(filtered, (item) => {
            const { created } = item
            if (dateTo && dateFrom) {
              return time(created) <= time(endOfDay(dateTo)) && time(created) >= time(startOfDay(dateFrom))
            }
            if (dateTo) return time(created) <= time(endOfDay(dateTo))
            return time(created) >= time(startOfDay(dateFrom))
          })
          return Promise.resolve(response.length)
        }
        return Promise.resolve(filter(all, filters).length)
      }
      return Promise.resolve(all.length)
    }
  }
}
