const camelCase = require('lodash/camelCase')
const { AppError } = require('@nudj/library/errors')
const { merge } = require('@nudj/library')

const handleErrors = require('./handle-errors')

module.exports = function rootAllByFilters (props = {}) {
  let {
    parentType,
    type,
    name,
    collection,
    filterType
  } = props
  if (!parentType) { throw new AppError('rootAllByFilters requires a parentType') }
  if (!type) throw new AppError('rootAllByFilters requires a type')
  name = name || `${camelCase(type)}sByFilters`
  collection = collection || `${camelCase(type)}s`
  filterType = filterType || `${type}FilterInput`

  return {
    typeDefs: `
      extend type ${parentType} {
        ${name}(filters: ${filterType}!): [${type}!]!
      }
    `,
    resolvers: {
      [parentType]: {
        [name]: handleErrors((root, args, context) => {
          return context.transaction((store, params) => {
            return store.readAll({
              type: params.collection,
              filters: params.filters
            })
          }, merge({
            collection
          }, args))
        })
      }
    }
  }
}
