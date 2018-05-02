const camelCase = require('lodash/camelCase')
const { AppError } = require('@nudj/library/errors')
const isEmpty = require('lodash/isEmpty')

const handleErrors = require('./handle-errors')

module.exports = function rootSingleByFilters (props = {}) {
  let {
    parentType,
    name,
    type,
    collection,
    filterType
  } = props
  if (!parentType) { throw new AppError('rootSingleByFilters requires a parentType') }
  if (!type) { throw new AppError('rootSingleByFilters requires a type') }
  name = name || `${camelCase(type)}ByFilters`
  collection = collection || `${camelCase(type)}s`
  filterType = filterType || `${type}FilterInput`

  return {
    typeDefs: `
      extend type ${parentType} {
        ${name}(filters: ${filterType}!): ${type}
      }
    `,
    resolvers: {
      [parentType]: {
        [name]: handleErrors((root, args, context) => {
          if (isEmpty(args.filters)) return null
          return context.sql.readOne({
            type: collection,
            filters: args.filters
          })
        })
      }
    }
  }
}
