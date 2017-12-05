const get = require('lodash/get')
const filter = require('lodash/filter')
const first = require('lodash/first')
const find = require('lodash/find')
const findIndex = require('lodash/findIndex')
const merge = require('lodash/merge')

function generateId () {
  const min = Math.ceil(1000)
  const max = Math.floor(9999)
  return Math.floor(Math.random() * (max - min)) + min
}

module.exports = ({ db }) => {
  return {
    create: ({
      type,
      data
    }) => {
      const id = `${type}${generateId()}`
      const entity = merge(data, { id })
      db[type].push(entity)
      return Promise.resolve(entity)
    },
    readOne: ({
      type,
      id,
      filters
    }) => {
      const all = get(db, type)
      if (filters) {
        return Promise.resolve(filter(all, filters)).then((result) => Promise.resolve(first(result)))
      }
      return Promise.resolve(find(all, { id }))
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
      return Promise.all(ids.map(id => find(all, { id })))
    },
    update: ({
      type,
      id,
      data
    }) => {
      const all = get(db, type)
      const entity = find(all, { id })
      Object.assign(entity, data)
      return Promise.resolve(entity)
    },
    delete: ({
      type,
      id
    }) => {
      const all = get(db, type)
      const index = findIndex(all, { id })
      return Promise.resolve(first(all.splice(index, 1)))
    }
  }
}
