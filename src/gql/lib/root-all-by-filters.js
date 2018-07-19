const camelCase = require('lodash/camelCase')
const { AppError } = require('@nudj/library/errors')

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
        [name]: (root, args, context) => {
          return context.sql.readAll({
            type: collection,
            filters: args.filters
          })
        }
      }
    }
  }
}
