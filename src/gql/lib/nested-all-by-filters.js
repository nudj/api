const camelCase = require('lodash/camelCase')
const { AppError } = require('@nudj/library/errors')

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
        [name]: (parent, args, context) => {
          return context.sql.readAll({
            type: collection,
            filters: {
              ...args.filters,
              [parentName]: parent.id
            }
          })
        }
      }
    }
  }
}
