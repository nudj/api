const camelCase = require('lodash/camelCase')
const { AppError } = require('@nudj/library/errors')
const { merge } = require('@nudj/library')

const handleErrors = require('./handle-errors')

module.exports = function nestedSingleByFilters (
  { parentType, type, parentName, name, collection, filterType } = {}
) {
  if (!parentType) {
    throw new AppError(
      'nestedSingleByFilters requires a parentType'
    )
  }
  if (!type) { throw new AppError('nestedSingleByFilters requires a type') }
  parentName = parentName || camelCase(parentType)
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
        [name]: handleErrors((parent, args, context) => {
          let filters = merge(args.filters, {
            [parentName]: parent.id
          })
          return context.transaction(
            (store, params) => {
              return store.readOne({
                type: params.collection,
                filters: params.filters
              })
            },
            {
              collection,
              filters
            }
          )
        })
      }
    }
  }
}
