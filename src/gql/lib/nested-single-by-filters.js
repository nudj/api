const camelCase = require('lodash/camelCase')
const omit = require('lodash/omit')
const filter = require('lodash/filter')
const first = require('lodash/first')
const { AppError } = require('@nudj/library/errors')
const { merge } = require('@nudj/library')

module.exports = function nestedSingleByFilters (props = {}) {
  let {
    parentType,
    type,
    parentName,
    name,
    collection,
    filterType
  } = props
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
        [name]: (parent, args, context) => {
          let filters = merge(args.filters, {
            [parentName]: parent.id
          })
          if (filters.id) {
            // arango does not support filtering by an id
            // so fetches by id and confirms match retrospectively
            return context.sql.readOne({
              type: collection,
              id: filters.id
            })
            // checks to make sure the result matches the non-id filters
            .then(result => first(filter([result], omit(filters, 'id'))))
          } else {
            return context.sql.readOne({
              type: collection,
              filters
            })
          }
        }
      }
    }
  }
}
