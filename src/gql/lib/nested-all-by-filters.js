const camelCase = require('lodash/camelCase')
const { AppError } = require('@nudj/library/errors')

const handleErrors = require('./handle-errors')

module.exports = function nestedAllByFilters (props = {}) {
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
      'nestedAllByFilters requires a parentType'
    )
  }
  if (!type) { throw new AppError('nestedAllByFilters requires a type') }
  parentName = parentName || camelCase(parentType)
  name = name || `${camelCase(type)}sByFilters`
  collection = collection || `${camelCase(type)}s`
  filterType = filterType || `${type}FilterInput`

  return {
    typeDefs: `
      extend type ${parentType} {
        # Filters "dateTo" and "dateFrom" are inclusive of the dates provided.
        ${name}(filters: ${filterType}!): [${type}!]!
      }
    `,
    resolvers: {
      [parentType]: {
        [name]: handleErrors((parent, args, context) => {
          args.filters[parentName] = parent.id
          return context.transaction(
            (store, params) => {
              return store.readAll({
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
