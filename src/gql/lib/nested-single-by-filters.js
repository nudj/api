const camelCase = require('lodash/camelCase')
const omit = require('lodash/omit')
const filter = require('lodash/filter')
const first = require('lodash/first')
const { AppError } = require('@nudj/library/errors')
const { merge } = require('@nudj/library')

const handleErrors = require('./handle-errors')

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
        [name]: handleErrors((parent, args, context) => {
          let filters = merge(args.filters, {
            [parentName]: parent.id
          })
          // arango does not support filtering by an id
          // so fetches by id and confirms match retrospectively
          if (filters.id) {
            return context.transaction(
              (store, params) => {
                return store.readOne({
                  type: params.collection,
                  id: params.id
                })
              },
              {
                collection,
                id: filters.id
              }
            )
            // checks to make sure the result matches the non-id filters
            .then(result => first(filter([result], omit(filters, 'id'))))
          } else {
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
          }
        })
      }
    }
  }
}
