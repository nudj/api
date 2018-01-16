const camelCase = require('lodash/camelCase')
const { AppError } = require('@nudj/library/errors')

const handleErrors = require('./handle-errors')

module.exports = function rootSingleByFilters (
  { parentType, name, type, collection, filterType } = {}
) {
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
          if (!Object.keys(args.filters).length) return null
          return context.transaction(
            (store, params) => {
              return store.readOne({
                type: params.collection,
                filters: params.filters
              })
            },
            {
              collection,
              filters: args.filters
            }
          )
        })
      }
    }
  }
}
