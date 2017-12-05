const get = require('lodash/get')
const filter = require('lodash/filter')
const first = require('lodash/first')
const find = require('lodash/find')

module.exports = ({ data }) => {
  return {
    readOne: ({
      type,
      id,
      filters
    }) => {
      const all = get(data, type)
      if (filters) {
        return Promise.resolve(filter(all, filters).then((result) => Promise.resolve(first(result))))
      }
      return Promise.resolve(find(all, { id }))
    },
    readAll: ({
      type,
      filters
    }) => {
      const all = get(data, type)
      if (filters) {
        return Promise.resolve(filter(all, filters))
      }
      return Promise.resolve(all)
    }
  }
}
