const camelCase = require('lodash/camelCase')
const { AppError } = require('@nudj/library/errors')

const handleErrors = require('./handle-errors')

module.exports = function nestedCountByFilters (props = {}) {
  let {
    parentType,
    parentName,
    name,
    type,
    collection,
    filterType
  } = props
  if (!parentType) {
    throw new AppError(
      'nestedCountByFilters requires a parentType'
    )
  }
  if (!type) { throw new AppError('nestedCountByFilters requires a type') }
  parentName = parentName || camelCase(parentType)
  name = name || `${camelCase(type)}sCountByFilters`
  collection = collection || `${camelCase(type)}s`
  filterType = filterType || `${type}FilterInput`

  return {
    typeDefs: `
      extend type ${parentType} {
        ${name}(filters: ${filterType}!): Int!
      }
    `,
    resolvers: {
      [parentType]: {
        [name]: handleErrors((parent, args, context) => {
          args.filters[parentName] = parent.id
          return context.sql.count({
            type: collection,
            filters: args.filters
          })
        })
      }
    }
  }
}
