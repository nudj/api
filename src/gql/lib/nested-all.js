const camelCase = require('lodash/camelCase')
const { AppError } = require('@nudj/library/errors')

const handleErrors = require('./handle-errors')

module.exports = function nestedAll (
  { parentType, type, name, collection, parentName, parentPropertyName } = {}
) {
  if (!parentType) { throw new AppError('nestedAll requires a parentType') }
  if (!type) throw new AppError('nestedAll requires a type')
  const camelTypePlural = `${camelCase(type)}s`
  name = name || camelTypePlural
  collection = collection || camelTypePlural
  parentName = parentName || camelCase(parentType)
  parentPropertyName = parentPropertyName || camelTypePlural

  return {
    typeDefs: `
      extend type ${parentType} {
        ${name}: [${type}!]!
      }
    `,
    resolvers: {
      [parentType]: {
        [name]: handleErrors((parent, args, context) => {
          const params = {
            collection
          }
          if (parent[parentPropertyName]) {
            params.ids = parent[parentPropertyName]
            params.storeMethod = 'readMany'
          } else {
            params.filters = {
              [parentName]: parent.id
            }
            params.storeMethod = 'readAll'
          }
          return context.transaction((store, params) => {
            return store[params.storeMethod]({
              type: params.collection,
              filters: params.filters,
              ids: params.ids
            })
          }, params)
        })
      }
    }
  }
}
