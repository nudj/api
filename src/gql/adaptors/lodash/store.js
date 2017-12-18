const get = require('lodash/get')
const filter = require('lodash/filter')
const first = require('lodash/first')
const find = require('lodash/find')
const flatten = require('lodash/flatten')
const findIndex = require('lodash/findIndex')
const toLower = require('lodash/toLower')
const merge = require('lodash/merge')
const { NotFound } = require('@nudj/library/errors')

module.exports = ({ db }) => {
  return {
    create: ({
      type,
      data
    }) => {
      const id = 'newId'
      const entity = merge(data, { id })
      db[type].push(entity)
      return Promise.resolve(entity)
    },
    readOne: ({
      type,
      id,
      filters
    }) => {
      return new Promise((resolve, reject) => {
        const all = get(db, type)
        let item
        if (filters) {
          item = first(filter(all, filters))
        } else {
          item = find(all, { id })
        }
        if (!item) return reject(new NotFound(`${type} with id ${id} not found`))
        return resolve(item)
      })
    },
    readAll: ({
      type,
      filters
    }) => {
      const all = get(db, type)
      if (filters) {
        return Promise.resolve(filter(all, filters))
      }
      return Promise.resolve(all)
    },
    readMany: ({
      type,
      ids
    }) => {
      const all = get(db, type)
      return Promise.all(ids.map(id => {
        const item = find(all, { id })
        if (!item) return Promise.reject(new NotFound(`${type} with id ${id} not found`))
        return item
      }))
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
        resolve(entity)
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
        return Promise.resolve(entity)
      }
      const id = 'newId'
      entity = merge(data, { id })
      db[type].push(entity)
      return Promise.resolve(entity)
    },
    search: ({
      type,
      query,
      fields
    }) => {
      const all = get(db, type)
      query = toLower(query)
      const entity = fields.map(field => {
        return filter(all, (obj) => toLower(obj[field]).includes(query))
      })
      return Promise.resolve(flatten(entity))
    }
  }
}
